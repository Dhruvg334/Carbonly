const test = require("node:test");
const assert = require("node:assert");
const { processBatchIngestion, clearIdempotencyCache } = require("../services/ingestionPipeline");
const { runDataQualityAudit } = require("../services/dataQualityEngine");
const { generateLineageDag } = require("../services/lineageDagService");

test("Data Engineering & Pipeline Unit Tests", async (t) => {

    await t.test("processBatchIngestion should process records and skip duplicates via idempotency key", () => {
        clearIdempotencyCache();
        const records = [
            { idempotencyKey: "KEY_001", transportKm: 180, electricityKwh: 350, flightsTaken: 1, waterLiters: 1200 },
            { idempotencyKey: "KEY_001", transportKm: 180, electricityKwh: 350, flightsTaken: 1, waterLiters: 1200 },
            { idempotencyKey: "KEY_002", transportKm: 100, electricityKwh: 200, flightsTaken: 0, waterLiters: 500 }
        ];

        const result = processBatchIngestion(records);
        assert.strictEqual(result.summary.totalReceived, 3);
        assert.strictEqual(result.summary.successfullyProcessed, 2);
        assert.strictEqual(result.summary.duplicatesSkipped, 1);
    });

    await t.test("runDataQualityAudit should calculate quality score and pass valid range bounds", () => {
        const payload = {
            transportKm: 150,
            electricityKwh: 400,
            flightsTaken: 2,
            waterLiters: 1000
        };

        const audit = runDataQualityAudit(payload);
        assert.strictEqual(audit.status, "PASSED");
        assert.strictEqual(audit.qualityScorePct, 100);
        assert.strictEqual(audit.failedCount, 0);
    });

    await t.test("generateLineageDag should build structured node and edge DAG tree", () => {
        const result = generateLineageDag("calc_test_001", {}, {});
        assert.strictEqual(result.calculationId, "calc_test_001");
        assert.strictEqual(result.dag.totalNodes, 8);
        assert.strictEqual(result.dag.totalEdges, 9);
        assert.ok(Array.isArray(result.dag.nodes));
        assert.ok(Array.isArray(result.dag.edges));
    });

});
