/**
 * Carbonly Constrained Decarbonization Linear Solver
 * Formulates a linear program to maximize carbon reduction subject to an annual capital budget constraint.
 */

function solveOptimalDecarbonization(annualBudget = 500, currentData = {}) {
    const budget = Math.max(50, Number(annualBudget || 500));
    const breakdown = currentData.breakdown || {};

    const transportKg = breakdown.transportKg || 100;
    const electricityKg = breakdown.electricityKg || 150;
    const flightsKg = breakdown.flightsKg || 80;

    // Define decarbonization intervention portfolio with realistic cost & abatement parameters
    const interventions = [
        {
            id: "ev_fleet_transition",
            name: "EV Fleet Transition (Scope 1)",
            maxPotentialKg: transportKg * 0.70,
            unitCostDollar: 300, // Capital cost per 100% adoption
            paybackYears: 2.5,
            abatementCostDollarPerTon: 45
        },
        {
            id: "solar_ppa_subscription",
            name: "Solar Renewable PPA (Scope 2)",
            maxPotentialKg: electricityKg * 0.90,
            unitCostDollar: 250,
            paybackYears: 1.8,
            abatementCostDollarPerTon: 28
        },
        {
            id: "virtual_flight_consolidation",
            name: "Virtual Flight Consolidation (Scope 3 - Category 6)",
            maxPotentialKg: flightsKg * 0.50,
            unitCostDollar: 50,
            paybackYears: 0.1,
            abatementCostDollarPerTon: -120 // Net positive cost savings
        }
    ];

    // Solve Knapsack/Linear Fractional Program: Sort by Abatement ROI (Kg Saved per Dollar)
    const sorted = [...interventions].sort((a, b) => {
        const roiA = a.maxPotentialKg / a.unitCostDollar;
        const roiB = b.maxPotentialKg / b.unitCostDollar;
        return roiB - roiA;
    });

    let remainingBudget = budget;
    let totalKgSaved = 0;
    let totalCostSpent = 0;
    const selectedInterventions = [];

    let transportReductionPct = 0;
    let renewablePpaPct = 0;
    let flightReductionPct = 0;

    sorted.forEach(interv => {
        if (remainingBudget <= 0) return;

        const fraction = Math.min(1.0, remainingBudget / interv.unitCostDollar);
        const costAllocated = Math.round(interv.unitCostDollar * fraction);
        const kgSaved = Math.round(interv.maxPotentialKg * fraction);

        remainingBudget -= costAllocated;
        totalCostSpent += costAllocated;
        totalKgSaved += kgSaved;

        if (interv.id === "ev_fleet_transition") transportReductionPct = Math.round(fraction * 70);
        if (interv.id === "solar_ppa_subscription") renewablePpaPct = Math.round(fraction * 90);
        if (interv.id === "virtual_flight_consolidation") flightReductionPct = Math.round(fraction * 50);

        selectedInterventions.push({
            name: interv.name,
            adoptionFractionPct: Math.round(fraction * 100),
            allocatedCostDollar: costAllocated,
            projectedKgSaved: kgSaved,
            paybackYears: interv.paybackYears,
            abatementCostDollarPerTon: interv.abatementCostDollarPerTon
        });
    });

    const baselineTotalKg = (transportKg + electricityKg + flightsKg) || 1;
    const netPercentReduced = Number(((totalKgSaved / baselineTotalKg) * 100).toFixed(1));
    const estimatedAnnualDollarSavings = Math.round(totalKgSaved * 0.42 * 12);

    return {
        objective: "Maximize Carbon Emissions Avoided Subject to Annual Budget Limit",
        annualBudget: budget,
        totalCostSpent,
        totalKgSaved,
        selectedInterventions,
        sliderRecommendations: {
            transportReductionPct,
            renewablePpaPct,
            flightReductionPct
        },
        impact: {
            kgSaved: totalKgSaved,
            netPercentReduced,
            estimatedAnnualDollarSavings
        }
    };
}

module.exports = {
    solveOptimalDecarbonization
};
