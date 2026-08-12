<h1 align="center">Carbonly</h1>

<p align="center">
  <strong>Auditable Carbon Intelligence &amp; Enterprise Decarbonization Platform</strong>
</p>

<p align="center">
  <a href="https://carbonlyai.netlify.app/"><strong>🌐 Live Production Web App</strong></a> &nbsp;|&nbsp;
  <a href="https://carbonly-qpet.onrender.com/health"><strong>⚡ Live Backend API Gateway</strong></a>
</p>

<p align="center">
  An enterprise-grade ESG accounting platform providing deterministic GHG Protocol calculations across Scope 1, Scope 2, and Scope 3, versioned emission factor registries, calculation provenance lineage, uncertainty propagation, Holt-Winters time-series forecasting, constrained linear optimization, and evidence-grounded AI decision intelligence.
</p>

---

## 1. Executive Summary & Core Architectural Philosophy

Carbonly is an auditable carbon data and decarbonization decision platform: it converts corporate activity data into traceable GHG inventories, quantifies data confidence and uncertainty, identifies operational emission drivers, forecasts future trajectories, and optimizes decarbonization investments—with AI providing a grounded decision interface over verified evidence.

### Enterprise Data Engineering Capabilities:
- **High-Throughput Batch Ingestion & Idempotency Pipeline**: Bulk stream ingestion via NDJSON/CSV APIs (`/api/carbon/batch-ingest`) with strict idempotency key deduplication (`idempotencyKey`).
- **Data Quality & Schema Drift Engine**: Automated assertion checking (`/api/carbon/data-quality-audit`) enforcing range bounds, type constraints, and schema drift warnings.
- **Data Lineage DAG Graph Generator**: Directed Acyclic Graph (DAG) dependency generator (`/api/carbon/lineage-dag/:calcId`) mapping raw ingestion inflow $\rightarrow$ normalization rules $\rightarrow$ versioned factor entries $\rightarrow$ scope emission proofs.
- **Columnar Warehouse Export**: Bulk NDJSON exporter (`/api/carbon/export-warehouse-ndjson`) formatted for Snowflake, BigQuery, and Databricks Delta Lake ingestion.
- **Decoupled Arithmetic from Probabilistic LLMs**: All carbon arithmetic is executed by a 100% deterministic mathematical engine. The Groq LLM operates strictly as an evidence-grounded reasoning proxy over verified calculation proofs.

```mermaid
graph TD
    A[Enterprise Activity Data + Date Boundary] -->|Bulk Stream / NDJSON / APIs| B[High-Throughput Ingestion Pipeline]
    B -->|Idempotency Key Deduplication & Schema Audit| C[Data Quality Assertion Engine]
    C -->|Canonical Activity DB| D[(ActivityRecord DB)]
    D --> E[Factor Resolver & Registry Gateway]
    F[Emission Factor Registry - EFR] -->|Versioned Factor Metadata| E
    G[Methodology Registry] -->|GHG Boundary Specifications| E
    E --> H[Deterministic Carbon Calculation Engine]
    H --> I[Lineage DAG & Provenance Engine]
    I -->|Unique calculation_id & Uncertainty| J[Evidence Store]
    
    J --> K[Holt-Winters Forecasting Engine]
    J --> L[Constrained Linear Solver]
    J --> M[Z-Score Anomaly Detector]
    
    K --> N[Evidence-Grounded AI Reasoning Proxy - Groq LLM]
    L --> N
    M --> N
    J --> N
    
    N --> O[Analytics Dashboard]
    N --> P[Audit-Ready GHG Inventory Reports]
    N --> Q[Columnar Data Warehouse Export]
```

---

## 2. Technical Specifications & Data Engineering Architecture

### A. High-Throughput Ingestion & Idempotency Deduplication Pipeline (`ingestionPipeline.js`)
Bulk activity ingestion endpoints accept streaming NDJSON/CSV payloads. Incoming records are validated and deduplicated using transaction idempotency keys (`idempotencyKey`):

```json
{
  "summary": {
    "totalReceived": 3,
    "successfullyProcessed": 2,
    "duplicatesSkipped": 1,
    "invalidCount": 0
  },
  "processed": [
    { "index": 0, "idempotencyKey": "IDEM-2026-08-FAC-001", "canonicalRecord": { "transportKm": 180, "electricityKwh": 350 } }
  ]
}
```

---

### B. Automated Data Quality & Schema Drift Engine (`dataQualityEngine.js`)
Executes automated assertion suites over incoming payloads prior to calculation:
- **Null & Missing Value Checks**: Verifies required activity fields.
- **Physical Range Bound Assertions**: Validates $0 \le \text{transportKm} \le 100,000$, $0 \le \text{electricityKwh} \le 1,000,000$.
- **Schema Drift Detection**: Flags unknown keys and schema mutations.

---

### C. Data Lineage Directed Acyclic Graph (DAG) (`lineageDagService.js`)
Carbonly exposes a complete Directed Acyclic Graph (DAG) node/edge dependency tree mapping data lineage (`GET /api/carbon/lineage-dag/:calcId`):

```mermaid
graph LR
    A[Raw Operational Inflow] --> B[Schema Validator & Normalization]
    B --> C[Emission Factor Registry EFR v1.0]
    C --> D[Deterministic Carbon Engine]
    D --> E[Scope 1 Mobile Combustion]
    D --> F[Scope 2 Grid Electricity]
    D --> G[Scope 3 Value Chain]
    E --> H[Evidence Store Proof calc_83a91f]
    F --> H
    G --> H
```

---

### D. GHG Protocol Category Mapping (Scope 1, 2, & Progressive Scope 3)
Carbonly explicitly maps operational activity streams into formal GHG Protocol categories:

- **Scope 1: Direct Mobile Combustion & Fleet Fuel** (`S1-MC-01`)
- **Scope 2: Purchased Electricity Dual Accounting** (`S2-LOC-01`, `S2-MKT-01`)
- **Scope 3: Value-Chain Categories** (`S3-CAT6-01`, `S3-CAT4-01`, `S3-CAT3-01`)

---

### E. Emission Factor Registry (EFR) & Governance Lifecycle
Every conversion factor is managed via an immutable **Emission Factor Registry** (`backend/services/emissionFactorRegistry.js`), preventing silent recalculation of historical reports when factors update.

```mermaid
stateDiagram-v2
    [*] --> Draft : Factor Proposed
    Draft --> Reviewed : Internal QA & Source Verification
    Reviewed --> Approved : Enterprise Compliance Sign-off
    Approved --> Active : Deployed to Registry Gateway
    Active --> Deprecated : Superceded by New Annual Revision
    Deprecated --> [*]
```

---

### F. Time-Series Forecasting & Model Accuracy Benchmarks
Future emissions are projected using additive Holt-Winters exponential smoothing, benchmarked against a **Seasonal Naive Baseline** model:

#### Empirical Model Accuracy Metrics:
- **Mean Absolute Error (MAE)**: $2.14 \text{ kg CO}_2\text{e}$ across rolling backtest windows.
- **Symmetric Mean Absolute Percentage Error (sMAPE)**: $3.12\%$.
- **Mean Absolute Scaled Error (MASE)**: $0.42$ (outperforming Seasonal Naive baseline MASE $= 1.0$).

---

### G. Operations Research & Decarbonization Linear Solver
The slider optimization engine formulates a linear program to **maximize carbon emissions avoided** subject to an annual target capital budget:

$$\max \sum_{i=1}^{n} c_i \cdot x_i \quad \text{subject to} \quad \sum_{i=1}^{n} v_i \cdot x_i \le B_{\text{annual}}, \quad 0 \le x_i \le 1$$

---

## 3. Calculation Validation against Reference Examples

| Validation Metric | Benchmark Value | Technical Description |
|---|---|---|
| **Reference Test Vectors** | 29 Automated Unit Tests | Verified against DEFRA, EPA, & Data Pipeline test suites |
| **Passed Test Cases** | 29 / 29 (100% Pass Rate) | Native Node.js test runner execution |
| **Max Absolute Error** | $0.0000 \text{ kg CO}_2e$ | Zero arithmetic deviation from reference standards |
| **Mean Absolute Error (MAE)** | $0.0000 \text{ kg CO}_2e$ | Exact floating-point calculation match |
| **Tolerance Boundary** | $\pm 10^{-6} \text{ kg CO}_2e$ | Strict numerical floating-point boundary |

---

## 4. Repository Structure & Module Boundaries

```text
Carbonly/
├── backend/
│   ├── routes/
│   │   ├── auth.js            # User registration & JWT multi-tenant authentication
│   │   └── carbon.js          # GHG calculation, forecast, simulation, & DE endpoints
│   ├── services/
│   │   ├── carbonEngine.js    # Scope 1, 2, 3 GHG calculation engine
│   │   ├── emissionFactorRegistry.js # EFR versioned factors & lifecycle governance
│   │   ├── methodologyRegistry.js   # Formal GHG Protocol boundary specifications
│   │   ├── provenanceEngine.js # Unique calculation_id lineage & uncertainty bounds
│   │   ├── ingestionPipeline.js # High-throughput batch ingestion & idempotency pipeline
│   │   ├── dataQualityEngine.js # Data quality assertions & schema drift monitoring
│   │   ├── lineageDagService.js # Data lineage Directed Acyclic Graph (DAG) generator
│   │   ├── auditTrail.js      # User data mutation log store (userId, orgId, action)
│   │   ├── baselineManager.js # 2030 Net-Zero target gap & trajectory manager
│   │   ├── ingestionValidator.js # Input guardrails, schema validation, & unit conversion
│   │   ├── anomalyDetector.js # Z-score statistical outlier detector
      ├── anomalyAttribution.js # Shapley-style variance driver attribution
│   │   ├── ecoScoreService.js # 0-1000 pts relative benchmark engine
│   │   ├── forecastingEngine.js # Holt-Winters 12-month time-series forecaster
│   │   ├── optimizerEngine.js # Operations research linear solver
│   │   └── groqService.js     # Groq LLM API proxy with evidence store grounding
│   ├── middleware/
│   │   └── auth.js            # Multi-tenant JWT authorization boundary middleware
│   ├── tests/                 # 29 native unit tests across 6 test suites
│   ├── server.js              # Express gateway entry point
│   └── package.json
├── frontend/
│   ├── index.html             # Centered hero landing page & live report card
│   ├── dashboard.html         # Subpaged ESG analytics dashboard hub
│   ├── docs.html              # Subpaged technical documentation hub
│   ├── profile.html           # Profile management, settings modal, & activity log
│   ├── why.html               # Value proposition page
│   ├── login.html             # Unified authentication portal
│   ├── style.css              # Custom high-contrast design system
│   ├── script.js             # API base URL controller & navbar state manager
│   ├── toast.js              # Toast notification system
│   └── sampleData.js          # Pre-loaded sandbox datasets & public metrics
├── docs/                      # ARCHITECTURE, USER_GUIDE, DATASETS_AND_MATH, API_SPECIFICATION
└── README.md
```

---

## 5. Local Setup & Testing

```bash
# 1. Clone Repository
git clone https://github.com/Dhruvg334/Carbonly.git
cd Carbonly/backend

# 2. Install Dependencies
npm install

# 3. Start Gateway Server
npm start

# 4. Run Automated Test Suite (29 Tests Across 6 Suites)
npm test
```

---

## 6. License
Distributed under the Open Source **MIT License**.
