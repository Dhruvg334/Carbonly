/**
 * Authentic KernelSHAP (SHapley Additive exPlanations) Explainer Service
 * Formulates predictive surrogate model f(x), feature coalition subsets S ⊆ M, background distributions E[x],
 * and exact Shapley marginal value contributions phi_i(f, x) satisfying the Efficiency Axiom: sum(phi_i) = f(x) - E[f(x)].
 */

const { calculateEmissions } = require("./carbonEngine");
const { calculateEcoScore } = require("./ecoScoreService");

/**
 * Predictive Model f(x) mapping 5 operational features -> EcoScore rating (0 - 1000 pts)
 */
function predictEcoScore(xVector) {
    const emissions = calculateEmissions({
        transportKm: xVector[0],
        vehicleType: "gasoline",
        electricityKwh: xVector[1],
        region: "US",
        flightsTaken: xVector[2],
        flightType: "short",
        waterLiters: xVector[3],
        screenHours: 160,
        internetGb: xVector[4]
    });
    const ecoScore = calculateEcoScore(emissions.totalKg);
    return ecoScore.scorePoints;
}

/**
 * Executes exact KernelSHAP feature attribution over non-linear model f(x)
 */
function explainEcoScoreShap(currentPayload = {}) {
    const features = ["transportKm", "electricityKwh", "flightsTaken", "waterLiters", "internetGb"];
    const M = features.length; // 5 features -> 2^5 = 32 coalitions

    // Actual observation vector x
    const x = [
        Number(currentPayload.transportKm || 180),
        Number(currentPayload.electricityKwh || 350),
        Number(currentPayload.flightsTaken || 1),
        Number(currentPayload.waterLiters || 1200),
        Number(currentPayload.internetGb || 450)
    ];

    // Background reference expected baseline E[x]
    const E_x = [100, 200, 0, 500, 100];

    // Model outputs: f(x) and E[f(x)]
    const f_x = predictEcoScore(x);
    const E_f_x = predictEcoScore(E_x);

    // Value Function v(S) = f(x_S) where x_S[i] = x[i] if i in S else E_x[i]
    function valueFunction(coalitionIndices) {
        const x_S = E_x.slice();
        coalitionIndices.forEach(idx => {
            x_S[idx] = x[idx];
        });
        return predictEcoScore(x_S);
    }

    function factorial(n) {
        return n <= 1 ? 1 : n * factorial(n - 1);
    }

    // Compute exact SHAP values phi_i for each feature i
    const shapValues = [];

    for (let i = 0; i < M; i++) {
        const otherIndices = [];
        for (let j = 0; j < M; j++) {
            if (j !== i) otherIndices.push(j);
        }

        let phi_i = 0;
        const numSubsets = 1 << otherIndices.length; // 2^4 = 16 subsets

        for (let mask = 0; mask < numSubsets; mask++) {
            const S = [];
            for (let k = 0; k < otherIndices.length; k++) {
                if (mask & (1 << k)) {
                    S.push(otherIndices[k]);
                }
            }

            const sSize = S.length;
            const weight = (factorial(sSize) * factorial(M - sSize - 1)) / factorial(M);

            const S_with_i = [...S, i];
            const marginalContribution = valueFunction(S_with_i) - valueFunction(S);

            phi_i += weight * marginalContribution;
        }

        shapValues.push({
            feature: features[i],
            actualValue: x[i],
            backgroundExpectedValue: E_x[i],
            shapValue: Number(phi_i.toFixed(2))
        });
    }

    // Efficiency Axiom Verification: sum(phi_i) === f(x) - E[f(x)]
    const totalShapSum = shapleySum = shapValues.reduce((sum, item) => sum + item.shapValue, 0);
    const targetDelta = f_x - E_f_x;
    const efficiencyResidual = Math.abs(targetDelta - totalShapSum);

    shapValues.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

    return {
        explainerType: "KernelSHAP (SHapley Additive exPlanations) Predictive Surrogate Explainer",
        predictiveModel: "f(x) = EcoScore(x)",
        modelOutput_fx: f_x,
        expectedBaseOutput_E_fx: E_f_x,
        shapEfficiencyAxiomVerified: efficiencyResidual < 1.0,
        shapValues
    };
}

module.exports = {
    explainEcoScoreShap,
    predictEcoScore
};
