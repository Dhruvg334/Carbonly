const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const CarbonEntry = require("../models/CarbonEntry");
const { calculateEmissions } = require("../services/carbonEngine");
const { detectAnomalies } = require("../services/anomalyDetector");

/**
 * Helper to generate rule-based fallback recommendations
 */
function generateRecommendations(emissions) {
    const tips = [];
    const breakdown = emissions.breakdown || {};

    if (breakdown.transportKg > 50) {
        tips.push("Transport is your highest emission driver. Consider carpooling, transit, or EV transition to save up to 40% CO2e.");
    }
    if (breakdown.electricityKg > 40) {
        tips.push("High grid electricity footprint detected. Switch to LED lighting or consider renewable energy subscriptions.");
    }
    if (breakdown.flightsKg > 100) {
        tips.push("Air travel accounts for a major portion of your footprint. Opt for direct flights or train alternatives for short hauls.");
    }
    if (breakdown.digitalKg > 10) {
        tips.push("Digital footprint optimization: lowering video stream resolutions and turning off idle devices can reduce data center energy load.");
    }

    if (tips.length === 0) {
        tips.push("Maintain your current efficient habits. Regular tracking helps spot future optimization opportunities.");
    }

    return tips;
}

/**
 * POST /api/carbon/calculate
 * Computes deterministic GHG emissions, runs anomaly detection, and saves entry
 */
router.post("/calculate", authMiddleware, async (req, res) => {
    try {
        const activityData = req.body || {};
        
        // 1. Calculate deterministic GHG emissions
        const emissions = calculateEmissions(activityData);

        // 2. Fetch historical entries for anomaly evaluation
        const history = await CarbonEntry.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(20);

        // 3. Run statistical anomaly detection
        const anomalyReport = detectAnomalies(emissions, history);

        // 4. Generate recommendations
        const recommendations = generateRecommendations(emissions);

        // 5. Persist record
        const newEntry = new CarbonEntry({
            userId: req.user.id,
            activityData: {
                transportKm: Number(activityData.transportKm || activityData.transport_km || 0),
                vehicleType: activityData.vehicleType || "default",
                electricityKwh: Number(activityData.electricityKwh || activityData.electricity_consumption || activityData.energy_kwh || 0),
                region: activityData.region || "GLOBAL",
                flightsTaken: Number(activityData.flightsTaken || activityData.flights_taken || 0),
                flightType: activityData.flightType || "short",
                waterLiters: Number(activityData.waterLiters || activityData.water_usage || 0),
                screenHours: Number(activityData.screenHours || activityData.screen || 0),
                internetGb: Number(activityData.internetGb || activityData.internet || 0)
            },
            emissions,
            anomalyReport,
            recommendations
        });

        await newEntry.save();

        res.status(200).json({
            message: "Emissions calculated and recorded successfully",
            data: {
                ...emissions,
                final_carbon_emission: emissions.totalKg, // Legacy field compatibility
                anomalyReport,
                recommendations
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Calculation failed",
            error: error.message
        });
    }
});

/**
 * Backwards compatibility route for legacy frontend /api/carbon/add
 */
router.post("/add", authMiddleware, async (req, res) => {
    // Forward to calculate route handler logic
    try {
        const activityData = req.body || {};
        const emissions = calculateEmissions(activityData);
        const history = await CarbonEntry.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(20);
        const anomalyReport = detectAnomalies(emissions, history);
        const recommendations = generateRecommendations(emissions);

        const newEntry = new CarbonEntry({
            userId: req.user.id,
            activityData,
            emissions,
            anomalyReport,
            recommendations
        });

        await newEntry.save();

        res.status(200).json({
            message: "Carbon calculated successfully",
            data: {
                ...emissions,
                final_carbon_emission: emissions.totalKg,
                anomalyReport,
                recommendations
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Calculation failed",
            error: error.message
        });
    }
});

/**
 * GET /api/carbon/history
 * Returns user's emissions history
 */
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const history = await CarbonEntry.find({ userId: req.user.id }).sort({ timestamp: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving history" });
    }
});

/**
 * DELETE /api/carbon/history
 * Clears user history
 */
router.delete("/history", authMiddleware, async (req, res) => {
    try {
        await CarbonEntry.deleteMany({ userId: req.user.id });
        res.json({ message: "Emissions history cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing history" });
    }
});

/**
 * POST /api/carbon/simulate
 * Sensitivity / "What-If" scenario simulator
 */
router.post("/simulate", (req, res) => {
    try {
        const { baseline, parameters } = req.body;
        
        const baselineData = baseline || { transportKm: 100, electricityKwh: 200, flightsTaken: 1 };
        const baselineEmissions = calculateEmissions(baselineData);

        // Apply parameter modifications
        const scenarioData = {
            ...baselineData,
            transportKm: Math.max(0, baselineData.transportKm * (1 - (parameters.transportReductionPct || 0) / 100)),
            vehicleType: parameters.evTransition ? "electric" : (baselineData.vehicleType || "default"),
            electricityKwh: Math.max(0, baselineData.electricityKwh * (1 - (parameters.renewablePpaPct || 0) / 100)),
            flightsTaken: Math.max(0, baselineData.flightsTaken * (1 - (parameters.flightReductionPct || 0) / 100))
        };

        const scenarioEmissions = calculateEmissions(scenarioData);

        const kgSaved = Math.max(0, baselineEmissions.totalKg - scenarioEmissions.totalKg);
        const percentReduced = baselineEmissions.totalKg > 0 ? Number(((kgSaved / baselineEmissions.totalKg) * 100).toFixed(1)) : 0;
        
        // Estimated annual cost savings (approximate average energy/fuel cost per kg CO2e avoided)
        const estimatedDollarSavings = Math.round(kgSaved * 0.42 * 12);

        res.json({
            baseline: baselineEmissions,
            scenario: scenarioEmissions,
            impact: {
                kgSaved: Number(kgSaved.toFixed(3)),
                tonnesSaved: Number((kgSaved / 1000).toFixed(4)),
                percentReduced,
                estimatedAnnualDollarSavings: estimatedDollarSavings
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Simulation failed", error: error.message });
    }
});

module.exports = router;