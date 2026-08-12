const test = require("node:test");
const assert = require("node:assert/strict");
const { forecastEmissions } = require("../services/forecastingEngine");
const { solveOptimalDecarbonization } = require("../services/optimizerEngine");
const { attributeAnomalySpike } = require("../services/anomalyAttribution");

test("Advanced AI / DS / DA Engine Unit Tests", async (t) => {

    await t.test("forecastEmissions should generate 12 monthly projections and confidence bounds", () => {
        const result = forecastEmissions([], 200.0);
        assert.equal(result.forecastMonths.length, 12);
        assert.equal(result.asIsSeries.length, 12);
        assert.equal(result.targetSeries.length, 12);
        assert.equal(result.upperBounds.length, 12);
        assert.ok(result.annualProjectedAsIsKg > 0);
    });

    await t.test("solveOptimalDecarbonization should allocate interventions within budget", () => {
        const result = solveOptimalDecarbonization(500, {
            breakdown: { transportKg: 200, electricityKg: 300, flightsKg: 100 }
        });
        assert.equal(result.annualBudget, 500);
        assert.ok(result.selectedInterventions.length > 0);
        assert.ok(result.impact.netPercentReduced > 0);
    });

    await t.test("attributeAnomalySpike should isolate primary variance driver", () => {
        const current = { breakdown: { transportKg: 500, electricityKg: 100, flightsKg: 50 } };
        const history = [{ emissions: { breakdown: { transportKg: 100, electricityKg: 100, flightsKg: 50 } } }];
        const attribution = attributeAnomalySpike(current, history);
        assert.equal(attribution.primaryDriver, "Direct Driving & Fuel");
        assert.ok(attribution.varianceAttribution[0].percentage > 50);
    });
});
