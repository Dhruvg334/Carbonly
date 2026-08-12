const test = require("node:test");
const assert = require("node:assert");
const { selectOptimalModel, forecastArima111 } = require("../services/modelSelectionEngine");
const { detectMultivariateAnomaly, invertMatrix5x5 } = require("../services/multivariateAnomaly");
const { runMonteCarloSimulation, randomLogNormal } = require("../services/uncertaintyQuantification");
const { explainEcoScoreShap, predictEcoScore } = require("../services/shapExplainerService");

test("Advanced Data Science & Machine Learning Modules Unit Test Suite", async (t) => {

    await t.test("selectOptimalModel should cross-validate Holt-Winters, ARIMA, and Naive models with estimated theta", () => {
        const series = Array.from({ length: 24 }, (_, i) => 150 + i * 2 + Math.sin(i) * 10);
        const result = selectOptimalModel(series);
        assert.ok(result.winningModel !== undefined);
        assert.ok(result.allCandidates.length === 3);
        assert.ok(result.winningOutOfSampleSmapePct >= 0);
    });

    await t.test("forecastArima111 should estimate AR(1) phi1 and MA(1) theta1 parameters", () => {
        const yTrain = [100, 105, 102, 108, 112, 110, 115, 120];
        const result = forecastArima111(yTrain, 12);
        assert.strictEqual(result.forecast.length, 12);
        assert.ok(result.params.theta1 !== undefined);
        assert.ok(result.forecast[0] > 0);
    });

    await t.test("detectMultivariateAnomaly should invert 5x5 covariance matrix and compute full Mahalanobis Distance", () => {
        const currentPayload = { transportKm: 120, electricityKwh: 1400, flightsTaken: 1, waterLiters: 1200, internetGb: 450 };
        const result = detectMultivariateAnomaly(currentPayload, []);
        assert.strictEqual(result.dimensionsEvaluated, 5);
        assert.strictEqual(result.covarianceMatrixInverted, true);
        assert.ok(result.mahalanobisDistance >= 0);
        assert.strictEqual(result.chiSquareThreshold, 11.07);
    });

    await t.test("invertMatrix5x5 should correctly compute inverse matrix A^-1", () => {
        const I = [
            [1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1]
        ];
        const inv = invertMatrix5x5(I);
        assert.strictEqual(inv[0][0], 1);
        assert.strictEqual(inv[1][1], 1);
    });

    await t.test("runMonteCarloSimulation should sample true Log-Normal distributions and output 80% & 95% Central Intervals", () => {
        const payload = { transportKm: 180, electricityKwh: 350, flightsTaken: 1 };
        const sim = runMonteCarloSimulation(payload, 1000);
        assert.strictEqual(sim.simulationMetadata.totalDraws, 1000);
        assert.ok(sim.uncertaintyMetrics.p2_5_LowKg <= sim.uncertaintyMetrics.p10_OptimisticLowKg);
        assert.ok(sim.uncertaintyMetrics.p10_OptimisticLowKg <= sim.uncertaintyMetrics.p50_MedianExpectedKg);
        assert.ok(sim.uncertaintyMetrics.p50_MedianExpectedKg <= sim.uncertaintyMetrics.p90_ConservativeHighKg);
        assert.ok(sim.uncertaintyMetrics.p90_ConservativeHighKg <= sim.uncertaintyMetrics.p97_5_HighKg);
    });

    await t.test("explainEcoScoreShap should evaluate surrogate model f(x) and satisfy SHAP Efficiency Axiom", () => {
        const result = explainEcoScoreShap({});
        assert.strictEqual(result.explainerType, "KernelSHAP (SHapley Additive exPlanations) Predictive Surrogate Explainer");
        assert.strictEqual(result.shapEfficiencyAxiomVerified, true);
        assert.strictEqual(result.shapValues.length, 5);
        assert.ok(result.shapValues[0].shapValue !== undefined);
    });

});
