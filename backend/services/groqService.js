const axios = require("axios");

/**
 * Groq AI Executive Intelligence & Decarbonization Service
 * Integrates with Groq API (llama-3.3-70b-versatile) for ultra-low latency AI decision support.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.3-70b-versatile";

/**
 * Makes an authenticated request to the Groq LLM API with structured fallback.
 */
async function callGroqLLM(systemPrompt, userPrompt) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key") {
        return null; // Signals fallback mode
    }

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 500
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 8000
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content.trim();
        }
        return null;
    } catch (error) {
        console.warn("Groq API call unavailable or rate-limited, utilizing deterministic fallback:", error.message);
        return null;
    }
}

/**
 * Generates an executive sustainability summary based on quantitative emissions metrics.
 */
async function generateExecutiveSummary(emissions, username = "User") {
    const systemPrompt = `You are a Senior ESG & Sustainability Analyst. Provide a concise, professional executive narrative (max 3 sentences) evaluating the user's carbon footprint. Focus on primary scope drivers, key categories, and baseline performance. Do not use filler or emojis.`;
    
    const userPrompt = `User: ${username}
Total Emissions: ${emissions.totalKg} kg CO2e (${emissions.totalTonnes} tCO2e)
Scope 1 (Direct Fleet): ${emissions.scopes.scope1.kg} kg (${emissions.scopes.scope1.percentage}%)
Scope 2 (Electricity): ${emissions.scopes.scope2.kg} kg (${emissions.scopes.scope2.percentage}%)
Scope 3 (Indirect/Travel): ${emissions.scopes.scope3.kg} kg (${emissions.scopes.scope3.percentage}%)
Breakdown: Transport=${emissions.breakdown.transportKg}kg, Electricity=${emissions.breakdown.electricityKg}kg, Flights=${emissions.breakdown.flightsKg}kg, Water=${emissions.breakdown.waterKg}kg, Digital=${emissions.breakdown.digitalKg}kg`;

    const aiResult = await callGroqLLM(systemPrompt, userPrompt);

    if (aiResult) {
        return aiResult;
    }

    // Deterministic fallback summary
    const primaryScope = emissions.scopes.scope1.percentage >= emissions.scopes.scope2.percentage && emissions.scopes.scope1.percentage >= emissions.scopes.scope3.percentage
        ? "Scope 1 (Direct Transport)"
        : emissions.scopes.scope2.percentage >= emissions.scopes.scope3.percentage
        ? "Scope 2 (Grid Electricity)"
        : "Scope 3 (Value Chain & Travel)";

    return `Current activity yields a total footprint of ${emissions.totalKg} kg CO2e (${emissions.totalTonnes} tCO2e), with ${primaryScope} identified as the primary emission vector. Implementing targeted efficiency measures in your top categories offers immediate carbon offset potential.`;
}

/**
 * Generates a root-cause explanation for a statistical consumption anomaly.
 */
async function explainAnomaly(anomalyReport, emissions) {
    if (!anomalyReport.isAnomaly) {
        return null;
    }

    const systemPrompt = `You are a Data Science & Energy Diagnostics Specialist. Provide a 2-sentence root-cause diagnosis for a statistical consumption spike. Focus on the primary contributing category and practical verification steps. No emojis.`;

    const userPrompt = `Anomaly Metrics:
Z-Score: ${anomalyReport.zScore}
Variance above baseline: +${anomalyReport.variancePercentage}%
Primary Contributor: ${anomalyReport.primaryContributor}
Current Emissions: ${emissions.totalKg} kg CO2e`;

    const aiResult = await callGroqLLM(systemPrompt, userPrompt);

    if (aiResult) {
        return aiResult;
    }

    // Fallback diagnosis
    return `Statistical Anomaly Triggered: Consumption in ${anomalyReport.primaryContributor} is ${anomalyReport.variancePercentage}% above your historical baseline (Z-Score: ${anomalyReport.zScore}). Verify equipment operational schedules or recent travel activity to identify transient usage patterns.`;
}

/**
 * Generates structured, prioritized decarbonization recommendations.
 */
async function generatePrioritizedActionPlan(emissions) {
    const systemPrompt = `You are a Sustainability Engineering Consultant. Provide exactly 3 prioritized, actionable decarbonization recommendations based on the user's category breakdown. Order by carbon reduction ROI. Return a JSON array of 3 strings. No markdown formatting outside JSON.`;

    const userPrompt = `Breakdown (kg CO2e):
Transport: ${emissions.breakdown.transportKg}
Electricity: ${emissions.breakdown.electricityKg}
Flights: ${emissions.breakdown.flightsKg}
Water: ${emissions.breakdown.waterKg}
Digital: ${emissions.breakdown.digitalKg}`;

    const aiResult = await callGroqLLM(systemPrompt, userPrompt);

    if (aiResult) {
        try {
            const cleanJson = aiResult.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            if (Array.isArray(parsed) && parsed.length >= 3) {
                return parsed.slice(0, 3);
            }
        } catch (e) {
            // Fall through to deterministic recommendations
        }
    }

    // Rule-based fallback recommendations
    const tips = [];
    if (emissions.breakdown.transportKg > emissions.breakdown.electricityKg) {
        tips.push("Prioritize transport efficiency: Transition 30% of weekly commutes to public transit or electric vehicle alternatives to reduce Scope 1 footprint.");
    } else {
        tips.push("Optimize electricity consumption: Upgrade lighting to high-efficiency LEDs and utilize smart power strips to lower Scope 2 grid draw.");
    }

    if (emissions.breakdown.flightsKg > 50) {
        tips.push("Consolidate air travel: Substitute short-haul flights with rail transport where feasible to eliminate high-altitude radiative forcing impacts.");
    } else {
        tips.push("Reduce digital & idle standby loads: Configure automatic sleep timers on workstations to curb digital footprint intensity.");
    }

    tips.push("Conduct periodic energy audits: Monitor weekly baseline metrics to catch operational anomalies before they accumulate.");

    return tips;
}

module.exports = {
    generateExecutiveSummary,
    explainAnomaly,
    generatePrioritizedActionPlan,
    callGroqLLM
};
