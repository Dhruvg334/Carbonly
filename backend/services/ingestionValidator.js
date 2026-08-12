/**
 * Carbonly Data Ingestion & Normalization Guardrails
 * Validates raw input payloads, sanitizes values, converts canonical units, and checks ranges.
 */

function validateAndNormalizeActivity(rawInput) {
    if (!rawInput || typeof rawInput !== "object") {
        throw new Error("Invalid payload: activity input must be a JSON object.");
    }

    const errors = [];

    // Sanitize numerical quantities (no negative values allowed)
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

    // Build Canonical Activity Record
    const canonicalRecord = {
        organizationId: rawInput.organizationId || "ORG-DEFAULT",
        facilityId: rawInput.facilityId || "FAC-PRIMARY",
        reportingPeriod: new Date().toISOString().substring(0, 7), // YYYY-MM
        activities: {
            fleetTransport: { quantity: transportKm, unit: "km", vehicleType },
            electricityDraw: { quantity: electricityKwh, unit: "kWh", region },
            businessTravel: { quantity: flightsTaken, unit: "flights", flightType },
            waterSupply: { quantity: waterLiters, unit: "Liters" },
            digitalTransfer: { gb: internetGb, hours: screenHours }
        }
    };

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
        canonicalRecord
    };
}

module.exports = {
    validateAndNormalizeActivity
};
