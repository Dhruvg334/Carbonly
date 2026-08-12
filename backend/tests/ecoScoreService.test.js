const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateEcoScore } = require("../services/ecoScoreService");

test("EcoScore & Star Rating Tests", async (t) => {
    await t.test("should return 5 stars and 1000 points for zero emissions baseline", () => {
        const score = calculateEcoScore(0);
        assert.equal(score.starRating, 5);
        assert.equal(score.scorePoints, 1000);
        assert.equal(score.tierName, "Pristine Zero Baseline");
    });

    await t.test("should return 5 stars for low emissions below 50% benchmark", () => {
        const score = calculateEcoScore(30); // 30 kg vs 86.5 kg benchmark
        assert.equal(score.starRating, 5);
        assert.ok(score.scorePoints >= 900);
    });

    await t.test("should return 4 stars for moderate emissions", () => {
        const score = calculateEcoScore(60); // 60 kg vs 86.5 kg benchmark
        assert.equal(score.starRating, 4);
        assert.ok(score.scorePoints >= 750 && score.scorePoints < 900);
    });

    await t.test("should return 1 star for high emissions exceeding 2.0x benchmark", () => {
        const score = calculateEcoScore(250);
        assert.equal(score.starRating, 1);
        assert.ok(score.scorePoints < 450);
    });
});
