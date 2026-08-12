# Carbonly Platform User Guide & Operational Handbook

## 1. Welcome to Carbonly
Carbonly is an auditable carbon data and decarbonization decision platform. This guide explains how to calculate GHG Protocol emissions, track Net-Zero target gaps, run Holt-Winters forecasts, optimize decarbonization investments, and interact with the AI strategy copilot.

---

## 2. Platform Navigation & Subpage Hubs

### A. ESG Analytics Dashboard (`dashboard.html`)
- **Panel 1: Footprint Overview**: View total emissions ($tCO_2e$), Scope breakdown, Data Quality Confidence Score ($0-100\%$), calculation lineage ID (`calc_83a91f`), and download Audit-Ready GHG Reports.
- **Panel 2: Activity Calculator**: Enter operational driving, electricity, flight, water, and digital activity metrics. Raw inputs pass through `ingestionValidator.js` canonical normalization guardrails.
- **Panel 3: What-If Simulator & Baseline Manager**: Model Net-Zero target trajectories, calculate 2030 target gaps, and execute linear programming optimization algorithms.
- **Panel 4: AI Strategy Hub**: Interact with the Groq AI Copilot reasoning agent over verified Evidence Store proofs.

### B. Technical Documentation Hub (`docs.html`)
- **Panel 1: Overview & App Guide**: System architecture overview, security controls, and multi-tenant authorization boundaries.
- **Panel 2: Datasets & Validation Benchmarks**: Public DEFRA/EPA datasets, 25/25 automated unit test pass rates, and empirical forecasting backtest metrics.
- **Panel 3: Mathematical Models**: GHG Protocol equations, uncertainty propagation formulas ($\pm \text{margin}$), and linear solver formulations.
- **Panel 4: REST API Reference**: Interactive API endpoint specifications, JWT authentication, and JSON request/response schemas.

### C. Profile & History Hub (`profile.html`)
- View account details, change display name/location, execute password resets, review EcoScore benchmarks, and inspect historical emissions activity logs.

---

## 3. Core Operational Workflows

### A. Generating a Traceable Carbon Footprint
1. Navigate to the **Dashboard** $\rightarrow$ **Activity Calculator**.
2. Input fleet transport distance (km), electricity consumption (kWh), flight count, water supply (L), and digital workload.
3. Click **Calculate Traceable Footprint**.
4. Review the generated `calculation_id` (`calc_83a91f`), Scope distribution bar chart, and Data Confidence Score.

### B. Net-Zero Target Trajectory & Optimization
1. Navigate to the **What-If Simulator**.
2. Set your target annual decarbonization budget slider.
3. Click **Solve Decarbonization Portfolio**.
4. The linear solver maximizes carbon reduction, displaying ROI payback periods and abatement costs per $tCO_2e$.
