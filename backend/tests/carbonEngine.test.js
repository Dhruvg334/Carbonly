const { describe, it } = require("node:test");
const assert = require("node:assert");
const { calculateEmissions, EMISSION_FACTORS } = require("../services/carbonEngine");
const { detectAnomalies } = require("../services/anomalyDetector");

describe("Deterministic Carbon Calculation Engine Tests", () => {

    it("should correctly compute Scope 1 vehicle transport emissions for gasoline", () => {
        const result = calculateEmissions({
            transportKm: 100,
            vehicleType: "gasoline"
        });

        const expectedKg = 100 * EMISSION_FACTORS.transport.gasoline; // 19.2 kg
        assert.strictEqual(result.scopes.scope1.kg, expectedKg);
        assert.strictEqual(result.breakdown.transportKg, expectedKg);
    });

    it("should correctly compute Scope 2 electricity emissions for US grid", () => {
        const result = calculateEmissions({
            electricityKwh: 200,
            region: "US"
        });

        const expectedKg = 200 * EMISSION_FACTORS.electricityGrid.US; // 77 kg
        assert.strictEqual(result.scopes.scope2.kg, expectedKg);
        assert.strictEqual(result.breakdown.electricityKg, expectedKg);
    });

    it("should correctly compute Scope 3 flight emissions with radiative forcing multiplier", () => {
        const result = calculateEmissions({
            flightsTaken: 2,
            flightType: "short"
        });

        const expectedKm = 2 * EMISSION_FACTORS.flights.shortHaulKmAvg;
        const expectedKg = Number((expectedKm * EMISSION_FACTORS.flights.shortHaulFactor * EMISSION_FACTORS.flights.radiativeForcingMultiplier).toFixed(3));
        
        assert.strictEqual(result.breakdown.flightsKg, expectedKg);
    });

    it("should calculate correct percentage breakdown across scopes", () => {
        const result = calculateEmissions({
            transportKm: 100,
            vehicleType: "gasoline", // 19.2 kg
            electricityKwh: 200,
            region: "US" // 77 kg
        });

        const total = result.totalKg;
        assert.strictEqual(total, 96.2);
        assert.strictEqual(result.scopes.scope1.percentage, 20.0); // (19.2 / 96.2) * 100
        assert.strictEqual(result.scopes.scope2.percentage, 80.0); // (77.0 / 96.2) * 100
    });

});

describe("Statistical Anomaly Detector Tests", () => {

    it("should return false for anomaly when emissions are near mean baseline", () => {
        const history = [
            { carbonEmission: 100 },
            { carbonEmission: 105 },
            { carbonEmission: 98 },
            { carbonEmission: 102 }
        ];
        const currentEntry = { totalKg: 104, breakdown: { transportKg: 50 } };

        const anomalyReport = detectAnomalies(currentEntry, history);
        assert.strictEqual(anomalyReport.isAnomaly, false);
    });

    it("should detect statistical anomaly when Z-score exceeds 2.0 threshold", () => {
        const history = [
            { carbonEmission: 100 },
            { carbonEmission: 102 },
            { carbonEmission: 98 },
            { carbonEmission: 101 }
        ];
        // Outlier spike to 300 kg
        const currentEntry = { totalKg: 300, breakdown: { electricityKg: 250, transportKg: 50 } };

        const anomalyReport = detectAnomalies(currentEntry, history);
        assert.strictEqual(anomalyReport.isAnomaly, true);
        assert.strictEqual(anomalyReport.primaryContributor, "Grid Electricity");
    });

});
