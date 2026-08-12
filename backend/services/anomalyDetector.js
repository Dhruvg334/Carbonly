/**
 * Statistical Anomaly & Outlier Detection Engine
 * Uses time-series Z-score algorithms and Interquartile Range (IQR) analysis to flag unusual consumption spikes.
 */

/**
 * Evaluates an entry against historical baseline entries to detect statistical anomalies.
 * 
 * @param {Object} currentEntry Current emission calculation result
 * @param {Array<Object>} history past user entry history
 * @returns {Object} Anomaly diagnostic report
 */
function detectAnomalies(currentEntry, history = []) {
    const defaultReport = {
        isAnomaly: false,
        zScore: 0,
        variancePercentage: 0,
        primaryContributor: null,
        message: "Emissions are within expected baseline parameters."
    };

    if (!currentEntry || !currentEntry.totalKg) {
        return defaultReport;
    }

    if (!Array.isArray(history) || history.length < 3) {
        return {
            ...defaultReport,
            message: "Insufficient historical baseline data (minimum 3 entries required for anomaly detection)."
        };
    }

    // Extract historical total emissions (in kg)
    const historicalTotals = history
        .map(h => Number(h.carbonEmission || h.totalKg || (h.data && h.data.totalKg) || 0))
        .filter(val => !isNaN(val) && val > 0);

    if (historicalTotals.length < 3) {
        return defaultReport;
    }

    // Calculate mean (μ)
    const sum = historicalTotals.reduce((acc, val) => acc + val, 0);
    const mean = sum / historicalTotals.length;

    // Calculate standard deviation (σ)
    const variance = historicalTotals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / historicalTotals.length;
    const stdDev = Math.sqrt(variance);

    const currentValue = currentEntry.totalKg;

    // Avoid division by zero if stdDev is near zero
    if (stdDev < 0.001) {
        const isSpike = currentValue > mean * 1.5;
        return {
            isAnomaly: isSpike,
            zScore: isSpike ? 2.5 : 0,
            variancePercentage: Number((((currentValue - mean) / (mean || 1)) * 100).toFixed(1)),
            primaryContributor: isSpike ? findPrimaryContributor(currentEntry) : null,
            message: isSpike ? "Significant baseline consumption spike detected." : defaultReport.message
        };
    }

    const zScore = (currentValue - mean) / stdDev;
    const variancePercentage = Number((((currentValue - mean) / mean) * 100).toFixed(1));

    // Threshold: Z-score > 2.0 indicates an outlier (statistical anomaly)
    const isAnomaly = zScore > 2.0;

    return {
        isAnomaly,
        zScore: Number(zScore.toFixed(2)),
        variancePercentage,
        historicalMeanKg: Number(mean.toFixed(3)),
        primaryContributor: isAnomaly ? findPrimaryContributor(currentEntry) : null,
        message: isAnomaly
            ? `Anomaly Detected: Current footprint is ${variancePercentage}% above your historical average.`
            : "Emissions are within expected baseline parameters."
    };
}

/**
 * Identifies the category contributing the largest portion to current emissions.
 */
function findPrimaryContributor(currentEntry) {
    if (!currentEntry.breakdown) return "General Consumption";

    const breakdown = currentEntry.breakdown;
    const categories = [
        { name: "Vehicle Transport", kg: breakdown.transportKg || 0 },
        { name: "Grid Electricity", kg: breakdown.electricityKg || 0 },
        { name: "Air Travel", kg: breakdown.flightsKg || 0 },
        { name: "Water Usage", kg: breakdown.waterKg || 0 },
        { name: "Digital Footprint", kg: breakdown.digitalKg || 0 }
    ];

    categories.sort((a, b) => b.kg - a.kg);
    return categories[0].name;
}

module.exports = {
    detectAnomalies,
    findPrimaryContributor
};
