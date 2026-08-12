/**
 * Carbonly Calculation Provenance & Lineage Engine
 * Generates audit-trail lineage objects and propagates calculation uncertainty bounds (P10/P50/P90).
 */

const crypto = require("crypto");
const { getEmissionFactor } = require("./emissionFactorRegistry");

function generateCalculationLineage(inputActivity, scopeBreakdown) {
    const calcId = "calc_" + crypto.randomBytes(6).toString("hex");
    const timestamp = new Date().toISOString();

    // Map factors used for audit lineage
    const factorsUsed = [];

    // Scope 1 Lineage
    let s1FactorId = "DEFRA_TRANSPORT_GASOLINE_2024";
    if (inputActivity.vehicleType === "diesel") s1FactorId = "DEFRA_TRANSPORT_DIESEL_2024";
    if (inputActivity.vehicleType === "electric") s1FactorId = "DEFRA_TRANSPORT_EV_2024";
    factorsUsed.push(getEmissionFactor(s1FactorId));

    // Scope 2 Lineage
    let s2FactorId = "GLOBAL_GRID_DEFAULT_2024";
    if (inputActivity.region === "US") s2FactorId = "EPA_GRID_US_2023";
    if (inputActivity.region === "EU") s2FactorId = "EU_GRID_AVERAGE_2024";
    if (inputActivity.region === "IN") s2FactorId = "CEA_GRID_IN_2024";
    factorsUsed.push(getEmissionFactor(s2FactorId));

    // Scope 3 Lineage (Explicit GHG Protocol Categories)
    let s3FlightId = inputActivity.flightType === "long" ? "DEFRA_BUSINESS_TRAVEL_LONG_2024" : "DEFRA_BUSINESS_TRAVEL_SHORT_2024";
    factorsUsed.push(getEmissionFactor(s3FlightId));
    factorsUsed.push(getEmissionFactor("DEFRA_WATER_SUPPLY_2024"));
    factorsUsed.push(getEmissionFactor("DIGITAL_ACTIVITY_ESTIMATE_2024"));

    // Calculate propagated analytical uncertainty (+/- %)
    // Weighted uncertainty propagation formula: sqrt(sum((w_i * u_i)^2))
    const totalKg = scopeBreakdown.totalKg || 1;
    const u1 = (scopeBreakdown.scopes.scope1.kg / totalKg) * 5.0; // 5%
    const u2 = (scopeBreakdown.scopes.scope2.kg / totalKg) * 4.0; // 4%
    const u3 = (scopeBreakdown.scopes.scope3.kg / totalKg) * 12.0; // 12%

    const propagatedUncertaintyPct = Number(Math.sqrt(u1*u1 + u2*u2 + u3*u3).toFixed(2));
    const marginKg = Number((totalKg * (propagatedUncertaintyPct / 100)).toFixed(2));

    const p50 = Number(totalKg.toFixed(2));
    const p10 = Number(Math.max(0, totalKg - 1.28 * marginKg).toFixed(2));
    const p90 = Number((totalKg + 1.28 * marginKg).toFixed(2));

    // Calculate Data Confidence Score (0-100%) based on activity data completeness
    let confidenceScore = 95;
    if (!inputActivity.vehicleType || inputActivity.vehicleType === "default") confidenceScore -= 5;
    if (!inputActivity.region || inputActivity.region === "GLOBAL") confidenceScore -= 5;
    if (inputActivity.digitalEstimateUsed) confidenceScore -= 10;

    return {
        calculationId: calcId,
        timestamp,
        auditStandard: "GHG Protocol Corporate Accounting Standard (2024 Revision)",
        methodology: {
            scope1Method: "Fuel-Based Activity Distance Multiplication",
            scope2LocationMethod: "Location-Based Regional Grid Carbon Intensity",
            scope2MarketMethod: "Contractual Instrument PPA / REC Market Adjustment",
            scope3CategoryMapping: {
                flights: "GHG Protocol Category 6: Business Travel (IPCC AR6 1.9x Radiative Forcing)",
                water: "GHG Protocol Category 4/5: Operational Water Lifecycle Supply",
                digital: "GHG Protocol Category 3: Fuel & Energy-Related Digital Activities (Estimate)"
            }
        },
        dataQuality: {
            overallConfidenceScorePct: Math.max(50, confidenceScore),
            propagatedUncertaintyPct,
            marginKg,
            percentiles: { p10, p50, p90 }
        },
        factorsUsed
    };
}

module.exports = {
    generateCalculationLineage
};
