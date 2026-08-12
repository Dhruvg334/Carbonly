const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const CarbonEntry = require("../models/CarbonEntry");
const { calculateEmissions } = require("../services/carbonEngine");
const { detectAnomalies } = require("../services/anomalyDetector");
const {
    generateExecutiveSummary,
    explainAnomaly,
    generatePrioritizedActionPlan,
    callGroqLLM
} = require("../services/groqService");

/**
 * POST /api/carbon/calculate
 * Computes deterministic GHG emissions, runs anomaly detection, invokes Groq AI intelligence, and saves entry
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

        // 4. Generate Groq AI Executive Intelligence & Anomaly Diagnosis
        const username = req.user.username || "User";
        const executiveSummary = await generateExecutiveSummary(emissions, username);
        const anomalyDiagnosis = await explainAnomaly(anomalyReport, emissions);
        const recommendations = await generatePrioritizedActionPlan(emissions);

        if (anomalyDiagnosis && anomalyReport.isAnomaly) {
            anomalyReport.aiDiagnosis = anomalyDiagnosis;
        }

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
                final_carbon_emission: emissions.totalKg, // Legacy compatibility
                executiveSummary,
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
    try {
        const activityData = req.body || {};
        const emissions = calculateEmissions(activityData);
        const history = await CarbonEntry.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(20);
        const anomalyReport = detectAnomalies(emissions, history);
        const executiveSummary = await generateExecutiveSummary(emissions, req.user.username || "User");
        const anomalyDiagnosis = await explainAnomaly(anomalyReport, emissions);
        const recommendations = await generatePrioritizedActionPlan(emissions);

        if (anomalyDiagnosis && anomalyReport.isAnomaly) {
            anomalyReport.aiDiagnosis = anomalyDiagnosis;
        }

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
                executiveSummary,
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
        const { baseline, parameters } = req.body || {};
        
        const baselineData = baseline || { transportKm: 100, electricityKwh: 200, flightsTaken: 1 };
        const baselineEmissions = calculateEmissions(baselineData);

        const params = parameters || {};
        const scenarioData = {
            ...baselineData,
            transportKm: Math.max(0, baselineData.transportKm * (1 - (params.transportReductionPct || 0) / 100)),
            vehicleType: params.evTransition ? "electric" : (baselineData.vehicleType || "default"),
            electricityKwh: Math.max(0, baselineData.electricityKwh * (1 - (params.renewablePpaPct || 0) / 100)),
            flightsTaken: Math.max(0, baselineData.flightsTaken * (1 - (params.flightReductionPct || 0) / 100))
        };

        const scenarioEmissions = calculateEmissions(scenarioData);
        const kgSaved = Math.max(0, baselineEmissions.totalKg - scenarioEmissions.totalKg);
        const percentReduced = baselineEmissions.totalKg > 0 ? Number(((kgSaved / baselineEmissions.totalKg) * 100).toFixed(1)) : 0;
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

/**
 * POST /api/carbon/ai-copilot
 * Direct interactive Groq AI Q&A Copilot endpoint
 */
router.post("/ai-copilot", authMiddleware, async (req, res) => {
    try {
        const { question, latestEmissions } = req.body;

        if (!question || typeof question !== "string") {
            return res.status(400).json({ message: "Question string is required" });
        }

        const systemPrompt = `You are Carbonly AI, an expert Sustainability & Decarbonization Assistant. Answer the user's question clearly, concisely, and practically. Focus on actionable insights, standard GHG accounting concepts, and cost/carbon efficiency. Keep response under 150 words. Do not use filler or emojis.`;

        let contextInfo = "";
        if (latestEmissions && typeof latestEmissions === "object") {
            contextInfo = `User's Latest Carbon Metrics: Total ${latestEmissions.totalKg || 0} kg CO2e. Breakdown: Transport=${latestEmissions.breakdown?.transportKg || 0}kg, Electricity=${latestEmissions.breakdown?.electricityKg || 0}kg, Flights=${latestEmissions.breakdown?.flightsKg || 0}kg.`;
        }

        const userPrompt = `${contextInfo}\nQuestion: ${question}`;
        const answer = await callGroqLLM(systemPrompt, userPrompt);

        if (answer) {
            return res.json({ answer, source: "groq-llama-3.3-70b-versatile" });
        }

        // Deterministic fallback response
        return res.json({
            answer: "To reduce your overall carbon footprint, focus first on your highest emission category. Replacing fossil-fuel commuting with transit or electric transport, and lowering grid electricity demand through efficiency upgrades typically yields the highest return on investment.",
            source: "deterministic-sustainability-rules"
        });
    } catch (error) {
        res.status(500).json({ message: "AI Copilot query failed", error: error.message });
    }
});

module.exports = router;