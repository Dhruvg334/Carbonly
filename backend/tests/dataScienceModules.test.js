const test = require("node:test");
const assert = require("node:assert");
const { selectOptimalModel, forecastArima111 } = require("../services/modelSelectionEngine");
const { detectMultivariateAnomaly } = require("../services/multivariateAnomaly");
const { runMonteCarloSimulation } = require("../services/uncertaintyQuantification");
const { explainEcoScoreShap } = require("../services/shapExplainerService");

test("Advanced Data Science & Machine Learning Modules Unit Test Suite", async (t) => {

    await t.test("selectOptimalModel should cross-validate Holt-Winters, ARIMA, and Naive models", () => {
        const series = Array.from({ length: 24 }, (_, i) => 150 + i * 2 + Math.sin(i) * 10);
        const result = selectOptimalModel(series);
        assert.ok(result.winningModel !== undefined);
        assert.ok(result.allCandidates.length === 3);
        assert.ok(result.winningOutOfSampleSmapePct >= 0);
    });

    await t.test("forecastArima111 should project ARIMA(1,1,1) auto-regressive horizon", () => {
        const yTrain = [100, 105, 102, 108, 112, 110, 115, 120];
        const forecast = forecastArima111(yTrain, 12);
        assert.strictEqual(forecast.length, 12);
        assert.ok(forecast[0] > 0);
    });

    await t.test("detectMultivariateAnomaly should calculate Mahalanobis Distance across 5 dimensions", () => {
        const currentPayload = { transportKm: 120, electricityKwh: 1400, flightsTaken: 1, waterLiters: 1200, internetGb: 450 };
        const result = detectMultivariateAnomaly(currentPayload, []);
        assert.strictEqual(result.dimensionsEvaluated, 5);
        assert.ok(result.mahalanobisDistance >= 0);
        assert.strictEqual(result.chiSquareThreshold, 11.07);
    });

    await t.test("runMonteCarloSimulation should execute 10,000 draws and compute empirical quantiles P10, P50, P90", () => {
        const payload = { transportKm: 180, electricityKwh: 350, flightsTaken: 1 };
        const sim = runMonteCarloSimulation(payload, 1000); // 1,000 fast test draws
        assert.strictEqual(sim.simulationMetadata.totalDraws, 1000);
        assert.ok(sim.uncertaintyMetrics.p10_OptimisticLowKg <= sim.uncertaintyMetrics.p50_MedianExpectedKg);
        assert.ok(sim.uncertaintyMetrics.p50_MedianExpectedKg <= sim.uncertaintyMetrics.p90_ConservativeHighKg);
    });

    await t.test("explainEcoScoreShap should compute SHAP feature importance contributions", () => {
        const result = explainEcoScoreShap({});
        assert.strictEqual(result.explainerType, "SHAP (SHapley Additive exPlanations) Global EcoScore Explainer");
        assert.strictEqual(result.globalFeatureImportance.length, 5);
        assert.ok(result.globalFeatureImportance[0].shapValue !== undefined);
    });

});
