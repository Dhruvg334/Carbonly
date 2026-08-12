/**
 * Carbonly Constrained Decarbonization Linear Solver (Primal Simplex Method)
 * Constructs a formal Simplex Tableau matrix, executes Gauss-Jordan pivoting, and finds Pareto-optimal decision variables.
 */

/**
 * Executes authentic Primal Simplex Method Linear Programming Solver
 * 
 * Maximize Z = c1*x1 + c2*x2 + c3*x3 (Total Carbon Abatement kg)
 * Subject to:
 *   w1*x1 + w2*x2 + w3*x3 <= Budget  (Capital Budget Limit)
 *   x1 <= 1.0                        (Transport Capacity Limit)
 *   x2 <= 1.0                        (Power Capacity Limit)
 *   x3 <= 1.0                        (Flight Capacity Limit)
 *   x1, x2, x3 >= 0
 */
function solveOptimalDecarbonization(annualBudget = 500, currentData = {}) {
    const budget = Math.max(50, Number(annualBudget || 500));
    const breakdown = currentData.breakdown || {};

    const transportKg = breakdown.transportKg || 100;
    const electricityKg = breakdown.electricityKg || 150;
    const flightsKg = breakdown.flightsKg || 80;

    // Decision Variables x1, x2, x3:
    // x1 = EV Fleet fraction (0 to 1) -> Yield c1 = transportKg * 0.70 kg, Cost w1 = $300
    // x2 = Solar PPA fraction (0 to 1) -> Yield c2 = electricityKg * 0.90 kg, Cost w2 = $250
    // x3 = Virtual Flight fraction (0 to 1) -> Yield c3 = flightsKg * 0.50 kg, Cost w3 = $50
    const c = [transportKg * 0.70, electricityKg * 0.90, flightsKg * 0.50];
    const w = [300, 250, 50];

    // Build Simplex Tableau Matrix (4 Constraints + Objective Row)
    // Variables: [x1, x2, x3, s1, s2, s3, s4, RHS]
    let tableau = [
        [w[0], w[1], w[2], 1, 0, 0, 0, budget], // Budget constraint
        [1, 0, 0, 0, 1, 0, 0, 1.0],           // x1 <= 1
        [0, 1, 0, 0, 0, 1, 0, 1.0],           // x2 <= 1
        [0, 0, 1, 0, 0, 0, 1, 1.0],           // x3 <= 1
        [-c[0], -c[1], -c[2], 0, 0, 0, 0, 0]  // Objective: Max Z -> -c1*x1 - c2*x2 - c3*x3 + Z = 0
    ];

    const numRows = 5;
    const numCols = 8;
    let iterations = 0;
    const maxIterations = 20;

    // Execute Simplex Pivot Iterations
    while (iterations < maxIterations) {
        iterations++;

        // 1. Entering Variable Selection: Most negative coefficient in bottom objective row
        let pivotCol = -1;
        let minVal = 0;
        for (let j = 0; j < 3; j++) {
            if (tableau[numRows - 1][j] < minVal) {
                minVal = tableau[numRows - 1][j];
                pivotCol = j;
            }
        }

        // Optimality criterion met if no negative entries in objective row
        if (pivotCol === -1) break;

        // 2. Leaving Variable Selection: Minimum positive ratio test (RHS / pivotCol)
        let pivotRow = -1;
        let minRatio = Infinity;
        for (let i = 0; i < numRows - 1; i++) {
            const entry = tableau[i][pivotCol];
            if (entry > 1e-6) {
                const ratio = tableau[i][numCols - 1] / entry;
                if (ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }

        if (pivotRow === -1) break; // Unbounded solution

        // 3. Pivot Operation (Gauss-Jordan Row Operations)
        const pivotVal = tableau[pivotRow][pivotCol];
        for (let j = 0; j < numCols; j++) {
            tableau[pivotRow][j] /= pivotVal;
        }

        for (let i = 0; i < numRows; i++) {
            if (i !== pivotRow) {
                const factor = tableau[i][pivotCol];
                for (let j = 0; j < numCols; j++) {
                    tableau[i][j] -= factor * tableau[pivotRow][j];
                }
            }
        }
    }

    // Extract Decision Variable Solution Values x1, x2, x3
    const x = [0, 0, 0];
    for (let col = 0; col < 3; col++) {
        let isBasic = true;
        let rowIdx = -1;
        for (let row = 0; row < numRows; row++) {
            const val = tableau[row][col];
            if (Math.abs(val - 1.0) < 1e-4) {
                if (rowIdx === -1) rowIdx = row;
                else isBasic = false;
            } else if (Math.abs(val) > 1e-4) {
                isBasic = false;
            }
        }
        if (isBasic && rowIdx !== -1) {
            x[col] = Math.min(1.0, Math.max(0, tableau[rowIdx][numCols - 1]));
        }
    }

    const x1Pct = Math.round(x[0] * 100);
    const x2Pct = Math.round(x[1] * 100);
    const x3Pct = Math.round(x[2] * 100);

    const transportReductionPct = Math.round(x[0] * 70);
    const renewablePpaPct = Math.round(x[1] * 90);
    const flightReductionPct = Math.round(x[2] * 50);

    const totalCostSpent = Math.round(w[0] * x[0] + w[1] * x[1] + w[2] * x[2]);
    const totalKgSaved = Math.round(c[0] * x[0] + c[1] * x[1] + c[2] * x[2]);
    const baselineTotalKg = (transportKg + electricityKg + flightsKg) || 1;
    const netPercentReduced = Number(((totalKgSaved / baselineTotalKg) * 100).toFixed(1));

    return {
        objective: "Primal Simplex LP Optimization: Maximize Carbon Saved Subject to Budget",
        solverMethod: "Primal Simplex Method (Gauss-Jordan Pivot Iterations)",
        simplexIterations: iterations,
        annualBudget: budget,
        totalCostSpent,
        totalKgSaved,
        optimalDecisionVariables: {
            evFleetAdoptionFraction: Number(x[0].toFixed(3)),
            solarPpaAdoptionFraction: Number(x[1].toFixed(3)),
            virtualFlightAdoptionFraction: Number(x[2].toFixed(3))
        },
        sliderRecommendations: {
            transportReductionPct,
            renewablePpaPct,
            flightReductionPct
        },
        impact: {
            kgSaved: totalKgSaved,
            netPercentReduced,
            estimatedAnnualDollarSavings: Math.round(totalKgSaved * 0.42 * 12)
        }
    };
}

module.exports = {
    solveOptimalDecarbonization
};
