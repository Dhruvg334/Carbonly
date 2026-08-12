/**
 * Data Lineage Directed Acyclic Graph (DAG) Generator Service
 * Exposes a structured node/edge dependency tree mapping raw input streams -> unit normalization -> EFR versioned factors -> scope emissions -> evidence store.
 */

function generateLineageDag(calcId, normalizedInput, emissions) {
    const calculationId = calcId || `calc_${Math.random().toString(36).substring(2, 8)}`;

    const nodes = [
        { id: "node_raw_inflow", label: "Raw Operational Inflow Payload", type: "INFLOW" },
        { id: "node_schema_validator", label: "Schema Validator & Unit Normalization", type: "TRANSFORMATION" },
        { id: "node_efr_gateway", label: "Emission Factor Registry (EFR v1.0)", type: "FACTOR_REGISTRY" },
        { id: "node_calc_engine", label: "Deterministic Carbon Calculation Engine", type: "ENGINE" },
        { id: "node_result_scope1", label: `Scope 1 Mobile Combustion (${(emissions?.scopes?.scope1?.kg || 0).toFixed(2)} kg)`, type: "SCOPE" },
        { id: "node_result_scope2", label: `Scope 2 Purchased Electricity (${(emissions?.scopes?.scope2?.kg || 0).toFixed(2)} kg)`, type: "SCOPE" },
        { id: "node_result_scope3", label: `Scope 3 Value-Chain (${(emissions?.scopes?.scope3?.kg || 0).toFixed(2)} kg)`, type: "SCOPE" },
        { id: "node_evidence_store", label: `Immutable Evidence Store Proof (${calculationId})`, type: "EVIDENCE" }
    ];

    const edges = [
        { from: "node_raw_inflow", to: "node_schema_validator", label: "validateAndNormalizeActivity()" },
        { from: "node_schema_validator", to: "node_efr_gateway", label: "resolveVersionedFactors()" },
        { from: "node_efr_gateway", to: "node_calc_engine", label: "injectFactors(DEFRA2024, EPA2023)" },
        { from: "node_calc_engine", to: "node_result_scope1", label: "calculateScope1()" },
        { from: "node_calc_engine", to: "node_result_scope2", label: "calculateScope2()" },
        { from: "node_calc_engine", to: "node_result_scope3", label: "calculateScope3()" },
        { from: "node_result_scope1", to: "node_evidence_store", label: "recordLineageProof()" },
        { from: "node_result_scope2", to: "node_evidence_store", label: "recordLineageProof()" },
        { from: "node_result_scope3", to: "node_evidence_store", label: "recordLineageProof()" }
    ];

    return {
        calculationId,
        dag: {
            nodes,
            edges,
            totalNodes: nodes.length,
            totalEdges: edges.length
        }
    };
}

module.exports = {
    generateLineageDag
};
