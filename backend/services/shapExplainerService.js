/**
 * SHAP (SHapley Additive exPlanations) Global Feature Importance Explainer Service
 * Calculates exact SHAP feature contributions for relative EcoScore percentile ranking across operational vectors.
 */

function explainEcoScoreShap(currentEmissions = {}) {
    const breakdown = currentEmissions.breakdown || { transportKg: 34.56, electricityKg: 134.75, flightsKg: 36.49, waterKg: 0.85, digitalKg: 15.2 };
    
    // Population baseline expected values (E[f(x)])
    const baselineMeans = {
        transportKg: 40.0,
        electricityKg: 110.0,
        flightsKg: 50.0,
        waterKg: 2.0,
        digitalKg: 20.0
    };

    const expectedEcoScoreBase = 750; // Expected baseline population score

    // Marginal EcoScore SHAP contribution per feature: phi_i = (E[X_i] - X_i) * sensitivity_i
    const sensitivities = {
        transportKg: -1.8,
        electricityKg: -2.2,
        flightsKg: -2.5,
        waterKg: -5.0,
        digitalKg: -3.0
    };

    const featureContributions = [];
    let cumulativeShap = 0;

    Object.keys(baselineMeans).forEach(feature => {
        const actual = Number(breakdown[feature] || 0);
        const expected = baselineMeans[feature];
        const diff = actual - expected; // positive means higher emissions than average (negative score impact)
        const shapValue = Number((diff * sensitivities[feature]).toFixed(2));
        cumulativeShap += shapValue;

        featureContributions.push({
            feature,
            actualValueKg: actual,
            expectedValueKg: expected,
            shapValue,
            impact: shapValue >= 0 ? "POSITIVE_PERCENTILE_BOOST" : "NEGATIVE_PERCENTILE_PENALTY"
        });
    });

    featureContributions.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

    const finalExploredScore = Math.min(1000, Math.max(0, Math.round(expectedEcoScoreBase + cumulativeShap)));

    return {
        explainerType: "SHAP (SHapley Additive exPlanations) Global EcoScore Explainer",
        baseExpectedEcoScore: expectedEcoScoreBase,
        finalExplainedEcoScore: finalExploredScore,
        globalFeatureImportance: featureContributions
    };
}

module.exports = {
    explainEcoScoreShap
};
