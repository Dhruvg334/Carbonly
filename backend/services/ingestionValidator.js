/**
 * Carbonly Data Ingestion & Normalization Guardrails
 * Validates raw input payloads, sanitizes values, converts canonical units, and builds generic ActivityRecord models.
 */

const crypto = require("crypto");

function validateAndNormalizeActivity(rawInput) {
    if (!rawInput || typeof rawInput !== "object") {
        throw new Error("Invalid payload: activity input must be a JSON object.");
    }

    const errors = [];

    // Sanitize numerical quantities
    const transportKm = Math.max(0, Number(rawInput.transportKm || 0));
    const electricityKwh = Math.max(0, Number(rawInput.electricityKwh || 0));
    const flightsTaken = Math.max(0, Math.floor(Number(rawInput.flightsTaken || 0)));
    const waterLiters = Math.max(0, Number(rawInput.waterLiters || 0));
    const screenHours = Math.max(0, Number(rawInput.screenHours || 0));
    const internetGb = Math.max(0, Number(rawInput.internetGb || 0));

    // Range checks to prevent invalid ingestion spikes
    if (transportKm > 100000) errors.push("transportKm exceeds realistic single-period threshold (100,000 km).");
    if (electricityKwh > 500000) errors.push("electricityKwh exceeds realistic single-facility threshold (500,000 kWh).");
    if (flightsTaken > 200) errors.push("flightsTaken exceeds realistic individual threshold (200 flights).");

    if (errors.length > 0) {
        throw new Error(`Data Validation Failure: ${errors.join(" ")}`);
    }

    // Normalize region & vehicle selection to canonical keys
    const validVehicles = ["gasoline", "diesel", "electric", "default"];
    const vehicleType = validVehicles.includes(rawInput.vehicleType) ? rawInput.vehicleType : "default";

    const validRegions = ["GLOBAL", "US", "EU", "IN"];
    const region = validRegions.includes(rawInput.region) ? rawInput.region : "GLOBAL";

    const validFlightTypes = ["short", "long"];
    const flightType = validFlightTypes.includes(rawInput.flightType) ? rawInput.flightType : "short";

    const orgId = rawInput.organizationId || "ORG-ENTERPRISE-891";
    const facId = rawInput.facilityId || "FAC-NORTH-AMERICA";
    const period = rawInput.reportingPeriod || new Date().toISOString().substring(0, 7);

    // Build array of normalized generic ActivityRecord models (Item 9)
    const canonicalActivityRecords = [
        {
            activityId: "act_" + crypto.randomBytes(4).toString("hex"),
            organizationId: orgId,
            facilityId: facId,
            reportingPeriod: period,
            activityType: "mobile_combustion",
            quantity: transportKm,
            unit: "km",
            geography: "UK/Global",
            source: "Fleet Telemetry",
            sourceRecordId: "rec_fleet_01",
            dataQuality: "High (98%)",
            methodologyId: "S1-MC-01",
            metadata: { vehicleType }
        },
        {
            activityId: "act_" + crypto.randomBytes(4).toString("hex"),
            organizationId: orgId,
            facilityId: facId,
            reportingPeriod: period,
            activityType: "purchased_electricity",
            quantity: electricityKwh,
            unit: "kWh",
            geography: region,
            source: "Smart Meter / Utility Invoice",
            sourceRecordId: "rec_util_01",
            dataQuality: "High (98%)",
            methodologyId: "S2-LOC-01",
            metadata: { region }
        },
        {
            activityId: "act_" + crypto.randomBytes(4).toString("hex"),
            organizationId: orgId,
            facilityId: facId,
            reportingPeriod: period,
            activityType: "business_travel",
            quantity: flightsTaken,
            unit: "flights",
            geography: "Global Aviation",
            source: "Travel API",
            sourceRecordId: "rec_travel_01",
            dataQuality: "Medium/High (90%)",
            methodologyId: "S3-CAT6-01",
            metadata: { flightType }
        }
    ];

    return {
        normalizedInput: {
            transportKm,
            vehicleType,
            electricityKwh,
            region,
            flightsTaken,
            flightType,
            waterLiters,
            screenHours,
            internetGb
        },
        canonicalRecord: {
            organizationId: orgId,
            facilityId: facId,
            reportingPeriod: period,
            idempotencyKey: rawInput.idempotencyKey || `IDEM-${period}-${facId}-001`,
            records: canonicalActivityRecords
        }
    };
}

module.exports = {
    validateAndNormalizeActivity
};
