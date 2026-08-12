const { describe, it } = require("node:test");
const assert = require("node:assert");
const {
    generateExecutiveSummary,
    explainAnomaly,
    generatePrioritizedActionPlan
} = require("../services/groqService");

describe("Groq AI Service & Fallback Unit Tests", () => {

    const mockEmissions = {
        totalKg: 150.5,
        totalTonnes: 0.1505,
        scopes: {
            scope1: { kg: 80, percentage: 53.2, category: "Direct Fleet & Vehicle Transport" },
            scope2: { kg: 50, percentage: 33.2, category: "Purchased Electricity" },
            scope3: { kg: 20.5, percentage: 13.6, categories: { flights: 0, water: 0.5, digital: 20 } }
        },
        breakdown: {
            transportKg: 80,
            electricityKg: 50,
            flightsKg: 0,
            waterKg: 0.5,
            digitalKg: 20
        }
    };

    it("should generate structured executive summary (via AI or deterministic fallback)", async () => {
        const summary = await generateExecutiveSummary(mockEmissions, "TestUser");
        assert.strictEqual(typeof summary, "string");
        assert.ok(summary.length > 20);
        assert.ok(summary.includes("150.5 kg CO2e") || summary.includes("Scope 1"));
    });

    it("should generate anomaly diagnosis when anomaly is triggered", async () => {
        const anomalyReport = {
            isAnomaly: true,
            zScore: 2.4,
            variancePercentage: 85,
            primaryContributor: "Vehicle Transport"
        };

        const diagnosis = await explainAnomaly(anomalyReport, mockEmissions);
        assert.strictEqual(typeof diagnosis, "string");
        assert.ok(diagnosis.includes("Vehicle Transport") || diagnosis.includes("85%"));
    });

    it("should return null for anomaly diagnosis when anomaly is false", async () => {
        const anomalyReport = { isAnomaly: false };
        const diagnosis = await explainAnomaly(anomalyReport, mockEmissions);
        assert.strictEqual(diagnosis, null);
    });

    it("should generate exactly 3 prioritized recommendations", async () => {
        const actionPlan = await generatePrioritizedActionPlan(mockEmissions);
        assert.ok(Array.isArray(actionPlan));
        assert.strictEqual(actionPlan.length, 3);
        assert.strictEqual(typeof actionPlan[0], "string");
    });

});
