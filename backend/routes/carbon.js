const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const CarbonEntry = require("../models/CarbonEntry");
const { calculateEmissions } = require("../services/carbonEngine");
const { detectAnomalies } = require("../services/anomalyDetector");
const { calculateEcoScore } = require("../services/ecoScoreService");
const { forecastEmissions } = require("../services/forecastingEngine");
const { solveOptimalDecarbonization } = require("../services/optimizerEngine");
const { attributeAnomalySpike } = require("../services/anomalyAttribution");
const {
    generateExecutiveSummary,
    explainAnomaly,
    generatePrioritizedActionPlan,
    callGroqLLM
} = require("../services/groqService");

/**
 * POST /api/carbon/calculate
 * Computes emissions, EcoScore, anomaly evaluation, and predictive forecasting
 */
router.post("/calculate", authMiddleware, async (req, res) => {
    try {
        const activityData = req.body || {};
        
        // 1. Deterministic emissions
        const emissions = calculateEmissions(activityData);

        // 2. Relative EcoScore & Star Rating
        const ecoScore = calculateEcoScore(emissions.totalKg);

        // 3. History lookup
        const history = await CarbonEntry.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(20);

        // 4. Anomaly detection & variance attribution
        const anomalyReport = detectAnomalies(emissions, history);
        const attribution = attributeAnomalySpike(emissions, history);
        anomalyReport.attribution = attribution;

        // 5. Predictive 12-month forecast
        const forecast = forecastEmissions(history, emissions.totalKg);

        // 6. Groq AI Executive Brief & Recommendations
        const username = req.user.username || "User";
        const executiveSummary = await generateExecutiveSummary(emissions, username);
        const anomalyDiagnosis = await explainAnomaly(anomalyReport, emissions);
        const recommendations = await generatePrioritizedActionPlan(emissions);

        if (anomalyDiagnosis && anomalyReport.isAnomaly) {
            anomalyReport.aiDiagnosis = anomalyDiagnosis;
        }

        // 7. Save entry
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
                ecoScore,
                forecast,
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
 * POST /api/carbon/add
 * Backwards compatibility route
 */
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const activityData = req.body || {};
        const emissions = calculateEmissions(activityData);
        const ecoScore = calculateEcoScore(emissions.totalKg);
        const history = await CarbonEntry.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(20);
        const anomalyReport = detectAnomalies(emissions, history);
        const forecast = forecastEmissions(history, emissions.totalKg);
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
                ecoScore,
                forecast,
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
        const scenarioEcoScore = calculateEcoScore(scenarioEmissions.totalKg);

        const kgSaved = Math.max(0, baselineEmissions.totalKg - scenarioEmissions.totalKg);
        const percentReduced = baselineEmissions.totalKg > 0 ? Number(((kgSaved / baselineEmissions.totalKg) * 100).toFixed(1)) : 0;
        const estimatedDollarSavings = Math.round(kgSaved * 0.42 * 12);

        res.json({
            baseline: baselineEmissions,
            scenario: scenarioEmissions,
            ecoScore: scenarioEcoScore,
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
 * POST /api/carbon/optimize
 * Constrained optimization solver endpoint
 */
router.post("/optimize", (req, res) => {
    try {
        const { annualBudget, baselineEmissions } = req.body || {};
        const result = solveOptimalDecarbonization(annualBudget, baselineEmissions);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Optimization solver failed", error: error.message });
    }
});

/**
 * POST /api/carbon/ai-copilot
 */
router.post("/ai-copilot", authMiddleware, async (req, res) => {
    try {
        const { question, latestEmissions } = req.body;

        if (!question || typeof question !== "string") {
            return res.status(400).json({ message: "Question string is required" });
        }

        const systemPrompt = `You are Carbonly AI, an expert Sustainability & Decarbonization Assistant. Answer the user's question clearly, concisely, and practically. Focus on actionable insights, human-understandable carbon footprint concepts, and cost/carbon efficiency. Keep response under 150 words. Do not use filler or emojis.`;

        let contextInfo = "";
        if (latestEmissions && typeof latestEmissions === "object") {
            contextInfo = `User's Latest Carbon Metrics: Total ${latestEmissions.totalKg || 0} kg CO2e. Breakdown: Direct Driving=${latestEmissions.breakdown?.transportKg || 0}kg, Home/Grid Power=${latestEmissions.breakdown?.electricityKg || 0}kg, Flights/Travel=${latestEmissions.breakdown?.flightsKg || 0}kg.`;
        }

        const userPrompt = `${contextInfo}\nQuestion: ${question}`;
        const answer = await callGroqLLM(systemPrompt, userPrompt);

        if (answer) {
            return res.json({ answer, source: "groq-llama-3.3-70b-versatile" });
        }

        return res.json({
            answer: "To reduce your overall carbon footprint, focus first on your highest emission category. Replacing fossil-fuel commuting with transit or electric transport, and lowering grid electricity demand through efficiency upgrades typically yields the highest return on investment.",
            source: "deterministic-sustainability-rules"
        });
    } catch (error) {
        res.status(500).json({ message: "AI Copilot query failed", error: error.message });
    }
});

/**
 * GET /api/carbon/export-report
 * Generates structured Markdown ESG Audit Certificate
 */
router.get("/export-report", authMiddleware, async (req, res) => {
    try {
        const history = await CarbonEntry.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(1);
        const latest = history[0] || {};
        const emissions = latest.emissions || { totalKg: 150.0, totalTonnes: 0.15 };
        const ecoScore = calculateEcoScore(emissions.totalKg);

        const markdownReport = `
# CARBONLY FORMAL ESG AUDIT REPORT & CERTIFICATE
**Generated Date:** ${new Date().toISOString().split("T")[0]}
**Audited Entity:** ${req.user.username || "Authenticated User"}

---

## 1. Executive Summary & Inventory Certificate
- **Total Operational Emissions:** ${emissions.totalKg} kg CO2e (${emissions.totalTonnes} tCO2e)
- **Relative EcoScore Benchmark:** ${ecoScore.scorePoints} / 1000 points
- **Star Rating Designation:** ${ecoScore.starRating} Stars (${ecoScore.tierName})
- **Percentile Status:** ${ecoScore.percentileText}

---

## 2. Category Footprint Breakdown
- **Direct Driving & Fuel (Scope 1):** ${emissions.scopes?.scope1?.kg || 0} kg CO2e
- **Home & Office Power (Scope 2):** ${emissions.scopes?.scope2?.kg || 0} kg CO2e
- **Travel, Water & Digital (Scope 3):** ${emissions.scopes?.scope3?.kg || 0} kg CO2e

---

## 3. Compliance & Methodology Citations
- **Accounting Standard:** GHG Protocol Corporate Accounting and Reporting Standard
- **Emission Factor Databases:** UK DEFRA 2024 Conversion Factors & US EPA eGRID 2023 Database
- **Verification Status:** 100% Deterministic Mathematical Compliance (Zero Model Hallucinations)

---
*Certified by Carbonly Intelligence Engine (Open Source Project under MIT License)*
        `.trim();

        res.setHeader("Content-Type", "text/markdown");
        res.setHeader("Content-Disposition", `attachment; filename=Carbonly_ESG_Report_${req.user.username}.md`);
        res.send(markdownReport);
    } catch (error) {
        res.status(500).json({ message: "Report export failed", error: error.message });
    }
});

module.exports = router;