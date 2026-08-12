/**
 * Carbonly Baseline & Net Zero Target Trajectory Manager
 * Tracks Baseline Emissions -> Current Emissions -> 2030 Target -> Target Gap.
 */

function calculateTargetGap(baselineEmissionsKg = 1000, currentEmissionsKg = 850, targetReductionPct = 50) {
    const targetEmissionsKg = baselineEmissionsKg * (1 - targetReductionPct / 100);
    const totalRequiredReductionKg = baselineEmissionsKg - targetEmissionsKg;
    const achievedReductionKg = Math.max(0, baselineEmissionsKg - currentEmissionsKg);
    const targetGapKg = Math.max(0, currentEmissionsKg - targetEmissionsKg);
    const progressPct = totalRequiredReductionKg > 0 ? Number(((achievedReductionKg / totalRequiredReductionKg) * 100).toFixed(1)) : 100;

    return {
        baselineYear: 2024,
        baselineEmissionsKg,
        currentEmissionsKg,
        targetYear: 2030,
        targetReductionPct,
        targetEmissionsKg,
        achievedReductionKg,
        targetGapKg,
        progressPct,
        status: targetGapKg === 0 ? "Target Achieved" : `${targetGapKg.toFixed(1)} kg CO2e gap to 2030 Net-Zero target`
    };
}

module.exports = {
    calculateTargetGap
};
