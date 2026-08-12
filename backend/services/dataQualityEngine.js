/**
 * Data Quality & Data Drift Monitoring Engine Service
 * Executes automated assertions over input payloads: missing value detection, physical range bound checks, and schema drift.
 */

function runDataQualityAudit(inputPayload) {
    const assertions = [];
    let passedCount = 0;
    let failedCount = 0;

    // Rule 1: Check for required measurement fields
    const requiredFields = ["transportKm", "electricityKwh", "flightsTaken", "waterLiters"];
    requiredFields.forEach(field => {
        const val = inputPayload[field];
        if (val === undefined || val === null) {
            assertions.push({ rule: `MISSING_FIELD_${field.toUpperCase()}`, status: "FAIL", message: `Required field ${field} is missing.` });
            failedCount++;
        } else if (typeof val !== "number" || isNaN(val)) {
            assertions.push({ rule: `INVALID_TYPE_${field.toUpperCase()}`, status: "FAIL", message: `Field ${field} must be a valid number.` });
            failedCount++;
        } else {
            assertions.push({ rule: `VALID_TYPE_${field.toUpperCase()}`, status: "PASS", message: `Field ${field} is valid type.` });
            passedCount++;
        }
    });

    // Rule 2: Physical Range Bound Checks
    const bounds = {
        transportKm: { min: 0, max: 100000 },
        electricityKwh: { min: 0, max: 1000000 },
        flightsTaken: { min: 0, max: 500 },
        waterLiters: { min: 0, max: 5000000 }
    };

    Object.keys(bounds).forEach(field => {
        const val = Number(inputPayload[field] || 0);
        const { min, max } = bounds[field];
        if (val < min || val > max) {
            assertions.push({
                rule: `RANGE_BOUND_${field.toUpperCase()}`,
                status: "FAIL",
                message: `Field ${field} value ${val} out of physical range bounds [${min}, ${max}].`
            });
            failedCount++;
        } else {
            assertions.push({ rule: `RANGE_BOUND_${field.toUpperCase()}`, status: "PASS", message: `Field ${field} within range.` });
            passedCount++;
        }
    });

    // Rule 3: Schema Drift & Unknown Field Detection
    const knownKeys = new Set(["reportingPeriod", "transportKm", "vehicleType", "electricityKwh", "region", "flightsTaken", "flightType", "waterLiters", "screenHours", "internetGb", "idempotencyKey"]);
    const payloadKeys = Object.keys(inputPayload || {});
    const unknownKeys = payloadKeys.filter(k => !knownKeys.has(k));

    if (unknownKeys.length > 0) {
        assertions.push({
            rule: "SCHEMA_DRIFT_ALERT",
            status: "WARN",
            message: `Detected ${unknownKeys.length} unknown schema fields: ${unknownKeys.join(", ")}.`
        });
    } else {
        assertions.push({ rule: "SCHEMA_DRIFT_CHECK", status: "PASS", message: "Schema conforms to canonical ActivityRecord spec." });
        passedCount++;
    }

    const totalRules = passedCount + failedCount;
    const qualityScorePct = totalRules > 0 ? Number(((passedCount / totalRules) * 100).toFixed(1)) : 100;

    return {
        qualityScorePct,
        passedCount,
        failedCount,
        status: failedCount === 0 ? "PASSED" : "FAILED",
        assertions
    };
}

module.exports = {
    runDataQualityAudit
};
