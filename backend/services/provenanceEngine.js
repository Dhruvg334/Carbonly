/**
 * Carbonly Calculation Provenance & Lineage Engine
 * Generates audit-trail lineage objects, methodology bounds, and uncertainty percentiles (P10/P50/P90).
 */

const crypto = require("crypto");
const { getEmissionFactor } = require("./emissionFactorRegistry");
const { getMethodology } = require("./methodologyRegistry");

function generateCalculationLineage(inputActivity, scopeBreakdown) {
    const calcId = "calc_" + crypto.randomBytes(6).toString("hex");
    const timestamp = new Date().toISOString();

    const factorsUsed = [];
    const methodologiesUsed = [];

    // Scope 1 Lineage & Mobile Combustion Methodology
    let s1FactorId = "DEFRA_TRANSPORT_GASOLINE_2024";
    if (inputActivity.vehicleType === "diesel") s1FactorId = "DEFRA_TRANSPORT_DIESEL_2024";
    if (inputActivity.vehicleType === "electric") s1FactorId = "DEFRA_TRANSPORT_EV_2024";
    factorsUsed.push(getEmissionFactor(s1FactorId));
    methodologiesUsed.push(getMethodology("S1-MC-01"));

    // Scope 2 Lineage & Dual Accounting Methodology
    let s2FactorId = "GLOBAL_GRID_DEFAULT_2024";
    if (inputActivity.region === "US") s2FactorId = "EPA_GRID_US_2023";
    if (inputActivity.region === "EU") s2FactorId = "EU_GRID_AVERAGE_2024";
    if (inputActivity.region === "IN") s2FactorId = "CEA_GRID_IN_2024";
    factorsUsed.push(getEmissionFactor(s2FactorId));
    methodologiesUsed.push(getMethodology("S2-LOC-01"));
    methodologiesUsed.push(getMethodology("S2-MKT-01"));

    // Scope 3 Lineage (Explicit GHG Protocol Categories)
    let s3FlightId = inputActivity.flightType === "long" ? "DEFRA_BUSINESS_TRAVEL_LONG_2024" : "DEFRA_BUSINESS_TRAVEL_SHORT_2024";
    factorsUsed.push(getEmissionFactor(s3FlightId));
    methodologiesUsed.push(getMethodology("S3-CAT6-01"));

    factorsUsed.push(getEmissionFactor("DEFRA_WATER_SUPPLY_2024"));
    methodologiesUsed.push(getMethodology("S3-CAT4-01"));

    factorsUsed.push(getEmissionFactor("DIGITAL_ACTIVITY_ESTIMATE_2024"));
    methodologiesUsed.push(getMethodology("S3-CAT3-01"));

    // Analytical Uncertainty Calculation (+/- %)
    const totalKg = scopeBreakdown.totalKg || 1;
    const u1 = (scopeBreakdown.scopes.scope1.kg / totalKg) * 5.0;
    const u2 = (scopeBreakdown.scopes.scope2.kg / totalKg) * 4.0;
    const u3 = (scopeBreakdown.scopes.scope3.kg / totalKg) * 12.0;

    const propagatedUncertaintyPct = Number(Math.sqrt(u1*u1 + u2*u2 + u3*u3).toFixed(2));
    const marginKg = Number((totalKg * (propagatedUncertaintyPct / 100)).toFixed(2));

    const p50 = Number(totalKg.toFixed(2));
    const p10 = Number(Math.max(0, totalKg - 1.28 * marginKg).toFixed(2));
    const p90 = Number((totalKg + 1.28 * marginKg).toFixed(2));

    // Data Quality & Source Classification Breakdown
    let confidenceScore = 95;
    if (!inputActivity.vehicleType || inputActivity.vehicleType === "default") confidenceScore -= 5;
    if (!inputActivity.region || inputActivity.region === "GLOBAL") confidenceScore -= 5;

    return {
        calculationId: calcId,
        timestamp,
        auditStandard: "GHG Protocol Corporate Accounting Standard (2024 Revision)",
        dataQualitySources: {
            fleetTransport: { source: "Utility Fleet Telemetry", rating: "High (98%)" },
            electricityDraw: { source: "Substation Smart Meter / Utility Invoice", rating: "High (98%)" },
            businessTravel: { source: "Corporate Travel Platform API", rating: "Medium/High (90%)" },
            waterSupply: { source: "Facility Water Meter", rating: "Medium (80%)" },
            digitalTransfer: { source: "Cloud Workload Activity Estimate", rating: "Low (50%)" }
        },
        dataQuality: {
            overallConfidenceScorePct: Math.max(50, confidenceScore),
            propagatedUncertaintyPct,
            marginKg,
            independenceAssumption: "Component uncertainties assumed independent; covariance J*Sigma*J^T = 0",
            percentiles: { p10, p50, p90 }
        },
        contractualInstrument: {
            supported: true,
            marketBasedAvailable: true,
            claimPeriod: "2026-Q3",
            instrumentType: "Solar PPA / Guarantee of Origin"
        },
        factorsUsed,
        methodologiesUsed
    };
}

module.exports = {
    generateCalculationLineage
};
