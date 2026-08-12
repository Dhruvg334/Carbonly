/**
 * EcoScore & Relative Star Rating Engine
 * Evaluates user emissions against national and global benchmarks to calculate relative performance scores.
 */

// Benchmark weekly average emissions (kg CO2e)
const GLOBAL_WEEKLY_BENCHMARK_KG = 86.5; // ~4.5 tonnes CO2e per year per person/facility

/**
 * Calculates EcoScore (0 to 1000 points) and Star Rating (1 to 5 Stars)
 * 
 * @param {number} totalKg Total emissions in kg CO2e for the evaluation period
 * @returns {Object} EcoScore metrics
 */
function calculateEcoScore(totalKg = 0) {
    const weeklyEmissions = Math.max(0, Number(totalKg || 0));
    
    // Calculate percentage relative to average benchmark
    const ratioToBenchmark = weeklyEmissions > 0 ? (weeklyEmissions / GLOBAL_WEEKLY_BENCHMARK_KG) : 0.5;

    let scorePoints = 1000;
    let starRating = 5;
    let tierName = "Climate Champion";
    let percentileText = "Top 10% Lowest Emissions";

    if (weeklyEmissions === 0) {
        scorePoints = 1000;
        starRating = 5;
        tierName = "Pristine Zero Baseline";
        percentileText = "Top 1% Benchmark";
    } else if (ratioToBenchmark <= 0.5) {
        scorePoints = Math.round(900 + (1 - ratioToBenchmark / 0.5) * 100);
        starRating = 5;
        tierName = "Climate Champion";
        percentileText = "Top 10% Lowest Emissions";
    } else if (ratioToBenchmark <= 0.85) {
        scorePoints = Math.round(750 + (1 - (ratioToBenchmark - 0.5) / 0.35) * 149);
        starRating = 4;
        tierName = "Eco Efficiency Leader";
        percentileText = "Top 25% Benchmark";
    } else if (ratioToBenchmark <= 1.25) {
        scorePoints = Math.round(600 + (1 - (ratioToBenchmark - 0.85) / 0.40) * 149);
        starRating = 3;
        tierName = "Average Baseline";
        percentileText = "Standard Global Average";
    } else if (ratioToBenchmark <= 2.0) {
        scorePoints = Math.round(400 + (1 - (ratioToBenchmark - 1.25) / 0.75) * 199);
        starRating = 2;
        tierName = "Moderate Emission Priority";
        percentileText = "Higher Than 65% of Benchmarks";
    } else {
        scorePoints = Math.max(100, Math.round(400 - (ratioToBenchmark - 2.0) * 50));
        starRating = 1;
        tierName = "High Decarbonization Priority";
        percentileText = "Requires Immediate Action";
    }

    return {
        scorePoints,
        starRating,
        tierName,
        percentileText,
        weeklyBenchmarkKg: GLOBAL_WEEKLY_BENCHMARK_KG,
        ratioToBenchmark: Number(ratioToBenchmark.toFixed(2))
    };
}

module.exports = {
    calculateEcoScore,
    GLOBAL_WEEKLY_BENCHMARK_KG
};
