/**
 * High-Throughput Batch Ingestion & Idempotency Pipeline Service
 * Processes bulk NDJSON/CSV activity logs, enforces schema validation, and deduplicates idempotency keys.
 */

const { validateAndNormalizeActivity } = require("./ingestionValidator");

const processedIdempotencyKeys = new Set();

/**
 * Process a bulk array of activity records with idempotency deduplication.
 * @param {Array} records - Array of raw activity objects with optional idempotencyKey.
 * @returns {Object} Batch ingestion result detailing processed, skipped (duplicate), and invalid records.
 */
function processBatchIngestion(records) {
    if (!Array.isArray(records)) {
        throw new Error("Batch ingestion payload must be an array of activity records.");
    }

    const processed = [];
    const skippedDuplicates = [];
    const invalidRecords = [];

    records.forEach((record, index) => {
        const key = record.idempotencyKey || `auto_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;

        if (processedIdempotencyKeys.has(key)) {
            skippedDuplicates.push({ index, idempotencyKey: key, reason: "Duplicate idempotency key skipped" });
            return;
        }

        try {
            const normalized = validateAndNormalizeActivity(record);
            processedIdempotencyKeys.add(key);
            processed.push({
                index,
                idempotencyKey: key,
                canonicalRecord: normalized.canonicalRecord,
                normalizedInput: normalized.normalizedInput
            });
        } catch (err) {
            invalidRecords.push({ index, record, error: err.message });
        }
    });

    return {
        summary: {
            totalReceived: records.length,
            successfullyProcessed: processed.length,
            duplicatesSkipped: skippedDuplicates.length,
            invalidCount: invalidRecords.length
        },
        processed,
        skippedDuplicates,
        invalidRecords
    };
}

function clearIdempotencyCache() {
    processedIdempotencyKeys.clear();
}

module.exports = {
    processBatchIngestion,
    clearIdempotencyCache
};
