const test = require("node:test");
const assert = require("node:assert");
const { calculateEmissions } = require("../services/carbonEngine");

/**
 * Official Real-World Public Datasets Benchmark Test Suite
 * Benchmarks Carbonly against UK DEFRA 2024 Conversion Factors and US EPA eGRID 2023 Database.
 */

// 1. UK DEFRA 2024 Official Benchmark Vectors
// Source: UK Department for Environment, Food & Rural Affairs (DEFRA) 2024 Conversion Factors
const DEFRA_2024_BENCHMARKS = [
    {
        name: "DEFRA 2024 Medium Gasoline Passenger Car (100 km)",
        input: { transportKm: 100, vehicleType: "gasoline", electricityKwh: 0, region: "US", flightsTaken: 0, flightType: "short", waterLiters: 0, screenHours: 0, internetGb: 0 },
        expectedScope1Kg: 19.20
    },
    {
        name: "DEFRA 2024 Medium Diesel Passenger Car (100 km)",
        input: { transportKm: 100, vehicleType: "diesel", electricityKwh: 0, region: "US", flightsTaken: 0, flightType: "short", waterLiters: 0, screenHours: 0, internetGb: 0 },
        expectedScope1Kg: 17.10
    },
    {
        name: "DEFRA 2024 Municipal Water Supply (1,000 Liters)",
        input: { transportKm: 0, vehicleType: "gasoline", electricityKwh: 0, region: "US", flightsTaken: 0, flightType: "short", waterLiters: 1000, screenHours: 0, internetGb: 0 },
        expectedScope3WaterKg: 0.708
    }
];

// 2. US EPA eGRID 2023 Regional Grid Benchmark Vectors
// Source: US Environmental Protection Agency (EPA) eGRID2023 Subregion Factors
const EPA_EGRID_2023_BENCHMARKS = [
    {
        name: "US EPA eGRID US National Grid Average (1,000 kWh)",
        input: { transportKm: 0, vehicleType: "gasoline", electricityKwh: 1000, region: "US", flightsTaken: 0, flightType: "short", waterLiters: 0, screenHours: 0, internetGb: 0 },
        expectedScope2Kg: 385.00
    },
    {
        name: "EU EEA Grid Average (1,000 kWh)",
        input: { transportKm: 0, vehicleType: "gasoline", electricityKwh: 1000, region: "EU", flightsTaken: 0, flightType: "short", waterLiters: 0, screenHours: 0, internetGb: 0 },
        expectedScope2Kg: 255.00
    },
    {
        name: "India CEA Grid Average (1,000 kWh)",
        input: { transportKm: 0, vehicleType: "gasoline", electricityKwh: 1000, region: "IN", flightsTaken: 0, flightType: "short", waterLiters: 0, screenHours: 0, internetGb: 0 },
        expectedScope2Kg: 710.00
    }
];

// 3. IPCC AR6 Aviation Radiative Forcing Multiplier Benchmark Vectors
const IPCC_AR6_BENCHMARKS = [
    {
        name: "IPCC AR6 Short-Haul Flight (1 Flight, 800 km, 1.9x RF)",
        input: { transportKm: 0, vehicleType: "gasoline", electricityKwh: 0, region: "US", flightsTaken: 1, flightType: "short", waterLiters: 0, screenHours: 0, internetGb: 0 },
        expectedScope3FlightKg: 237.12 // 800 * 0.156 * 1.9 = 237.12 kg CO2e
    },
    {
        name: "IPCC AR6 Long-Haul Flight (1 Flight, 3500 km, 1.9x RF)",
        input: { transportKm: 0, vehicleType: "gasoline", electricityKwh: 0, region: "US", flightsTaken: 1, flightType: "long", waterLiters: 0, screenHours: 0, internetGb: 0 },
        expectedScope3FlightKg: 764.75 // 3500 * 0.115 * 1.9 = 764.75 kg CO2e
    }
];

test("Real Public Datasets Benchmark Test Suite", async (t) => {

    await t.test("UK DEFRA 2024 Official Factor Benchmark Assertions", () => {
        DEFRA_2024_BENCHMARKS.forEach(b => {
            const result = calculateEmissions(b.input);
            if (b.expectedScope1Kg !== undefined) {
                const diff = Math.abs(result.scopes.scope1.kg - b.expectedScope1Kg);
                assert.ok(diff < 1e-3, `${b.name} failed: expected ${b.expectedScope1Kg}, got ${result.scopes.scope1.kg}`);
            }
            if (b.expectedScope3WaterKg !== undefined) {
                const diff = Math.abs(result.breakdown.waterKg - b.expectedScope3WaterKg);
                assert.ok(diff < 1e-3, `${b.name} failed: expected ${b.expectedScope3WaterKg}, got ${result.breakdown.waterKg}`);
            }
        });
    });

    await t.test("US EPA eGRID 2023 Official Grid Benchmark Assertions", () => {
        EPA_EGRID_2023_BENCHMARKS.forEach(b => {
            const result = calculateEmissions(b.input);
            const diff = Math.abs(result.scopes.scope2.kg - b.expectedScope2Kg);
            assert.ok(diff < 1e-3, `${b.name} failed: expected ${b.expectedScope2Kg}, got ${result.scopes.scope2.kg}`);
        });
    });

    await t.test("IPCC AR6 Radiative Forcing Aviation Multiplier Assertions", () => {
        IPCC_AR6_BENCHMARKS.forEach(b => {
            const result = calculateEmissions(b.input);
            const diff = Math.abs(result.breakdown.flightsKg - b.expectedScope3FlightKg);
            assert.ok(diff < 1e-3, `${b.name} failed: expected ${b.expectedScope3FlightKg}, got ${result.breakdown.flightsKg}`);
        });
    });

});
