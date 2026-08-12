# Carbonly Platform Architecture & Auditable System Blueprint

## 1. Executive Summary
Carbonly is an enterprise-grade carbon intelligence and ESG accounting platform. It strictly decouples **deterministic mathematical greenhouse gas accounting (GHG Protocol)** from **probabilistic AI decision support (Groq LLM)** to guarantee zero mathematical hallucinations, 100% auditability, and full calculation lineage.

```text
Data Ingestion Pipeline (Raw Input -> Schema Validation -> Unit Normalization -> Guardrails)
      ↓
Canonical Activity Records (ActivityRecord)
      ↓
Emission Factor Registry (EFR Versioning & Provenance Metadata)
      ↓
Deterministic Calculation Engine (Scope 1, Scope 2 Location & Market, Scope 3 Categories)
      ↓
Calculation Lineage & Uncertainty Engine (Unique Calculation ID, P10/P50/P90 Bounds, Confidence Score)
      ↓
Analytics Layer (Holt-Winters Forecasting, Linear Programming Solver, Shapley Attribution)
      ↓
Evidence Store (Verified Calculation Proofs)
      ↓
Evidence-Grounded AI Reasoning (Groq llama-3.3-70b-versatile LLM)
      ↓
Audit-Ready Reports & Interactive Dashboards
```

## 2. Core Architectural Components

### A. Emission Factor Registry (`emissionFactorRegistry.js`)
Maintains immutable, versioned emission factor conversion factors with complete audit metadata:
- `factor_id`, `version`, `effective_from`, `effective_to`, `geography`, `scope`, `ghg_category`, `source_organization`, `source_document`, `uncertainty_pct`, and `gas_coverage`.

### B. Calculation Lineage & Provenance Engine (`provenanceEngine.js`)
Attaches a unique `calculation_id` (e.g. `calc_83a91f`) to every result, linking:
- Final emission quantity ($kg CO_2e$) $\leftarrow$ Activity data $\leftarrow$ Normalized units $\leftarrow$ Factor ID & Version $\leftarrow$ Source document.
- Propagates analytical uncertainty ($\pm \text{margin}$) and percentiles (P10, P50, P90).
- Calculates an overall **Data Quality Confidence Score (0-100%)**.

### C. Ingestion Guardrails & Normalization (`ingestionValidator.js`)
Validates input schemas, checks range bounds, sanitizes negative values, and converts raw inputs into canonical `ActivityRecord` models.

### D. Evidence-Grounded AI Reasoning Layer (`groqService.js`)
The Groq LLM operates over an **Evidence Store** containing verified calculation proofs. It never calculates values directly; it synthesizes executive summaries and strategy recommendations strictly from verified evidence objects.
