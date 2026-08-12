# Carbonly Platform Architecture & Auditable System Blueprint

## 1. Executive Summary & Core Positioning
Carbonly is an **auditable carbon data and decarbonization decision platform**: it converts enterprise activity data into traceable GHG inventories, quantifies measurement uncertainty, detects operational consumption anomalies, forecasts emissions, optimizes decarbonization investments, and uses **evidence-grounded AI** to explain what happened and what the organization should do next.

```text
Enterprise Data (ERP / CSV / Utility APIs)
      ↓
Ingestion & Normalization Layer (Validation & Guardrails)
      ↓
Canonical Activity Database (ActivityRecord)
      ↓
Emission Factor Registry (EFR Governance) + Methodology Registry (MR Boundaries)
      ↓
Deterministic Calculation Engine (Scope 1 Mobile Combustion, Scope 2 Location/Market, Scope 3 Categories)
      ↓
Provenance Lineage Engine (calc_83a91f + Uncertainty P10/P50/P90 + Data Quality Score)
      ↓
Analytics Layer (Holt-Winters Forecasting, Linear Programming Solver, Residual Anomaly Detection)
      ↓
Evidence Store (Verified Calculation Proofs)
      ↓
Evidence-Grounded AI Reasoning Proxy (Groq llama-3.3-70b-versatile LLM)
      ↓
Audit-Ready GHG Inventory Reports & Interactive Dashboards
```

## 2. Core Architectural Components

### A. Emission Factor Registry & Governance (`emissionFactorRegistry.js`)
Maintains versioned, immutable factor records with explicit governance metadata (`lifecycle_status`, `approved_by`, `approved_at`, `source_hash`).

### B. Methodology Registry (`methodologyRegistry.js`)
Defines explicit GHG Protocol accounting boundaries and assumptions:
- `S1-MC-01`: Direct Mobile Combustion
- `S2-LOC-01`: Location-Based Electricity Grid Draw
- `S2-MKT-01`: Market-Based Electricity Contractual Instrument Method
- `S3-CAT6-01`: Category 6 Business Aviation Travel (IPCC AR6 1.9x RF)
- `S3-CAT4-01`: Category 4/5 Operational Water Supply & Treatment
- `S3-CAT3-01`: Category 3 Digital Infrastructure Activity Estimate Model

### C. Provenance & Audit Trail Engines (`provenanceEngine.js` & `auditTrail.js`)
- **Calculation Lineage**: Traces `calculation_id` $\leftarrow$ `ActivityRecord` $\leftarrow$ Factor Version $\leftarrow$ Source Doc.
- **Mutation Audit Trail**: Logs user data edits (`userId`, `organizationId`, `action`, `oldState`, `newState`, `reason`, `timestamp`).
