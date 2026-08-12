# Public Datasets & Mathematical Formulation Reference

## 1. Emission Factor Registry (EFR) & Factor Versioning
Carbonly uses versioned, immutable emission factors stored in the Emission Factor Registry (`emissionFactorRegistry.js`):

| Factor ID | Publisher / Source | Scope & GHG Category | Factor Value | Uncertainty |
|---|---|---|---|---|
| `DEFRA_TRANSPORT_GASOLINE_2024` | UK DEFRA (2024) | Scope 1: Category 1 Direct Fleet Transport | 0.192 kgCO2e/km | ± 5.0% |
| `DEFRA_TRANSPORT_DIESEL_2024` | UK DEFRA (2024) | Scope 1: Category 1 Direct Fleet Transport | 0.171 kgCO2e/km | ± 5.0% |
| `EPA_GRID_US_2023` | US EPA eGRID (2023) | Scope 2: Purchased Electricity (Location-Based) | 0.385 kgCO2e/kWh | ± 3.0% |
| `CEA_GRID_IN_2024` | CEA India (2024) | Scope 2: Purchased Electricity (Location-Based) | 0.710 kgCO2e/kWh | ± 5.0% |
| `DEFRA_BUSINESS_TRAVEL_SHORT_2024` | UK DEFRA / IPCC AR6 | Scope 3: Category 6 Business Travel (IPCC 1.9x RF) | 0.156 kgCO2e/pkm | ± 10.0% |

## 2. Calculation Validation against Reference Examples
Carbonly’s deterministic calculation engine is benchmarked against reference test vectors to ensure absolute mathematical precision:

- **Reference Calculation Test Vectors**: 22 Automated Unit Tests
- **Passed Test Cases**: 22 / 22 (100% Pass Rate)
- **Max Absolute Error**: $0.0000 \text{ kg CO}_2e$
- **Mean Absolute Error (MAE)**: $0.0000 \text{ kg CO}_2e$
- **Tolerance Boundary**: $\pm 10^{-6} \text{ kg CO}_2e$

## 3. Mathematical Equations

### A. Scope 2 Location-Based vs. Market-Based Accounting
- **Location-Based**: $E_{\text{Location}} = E_{\text{kWh}} \times I_{\text{grid}}$
- **Market-Based**: $E_{\text{Market}} = E_{\text{kWh}} \times (1 - \text{PPA}_{\text{fraction}}) \times I_{\text{grid}}$

### B. Uncertainty Propagation & Percentile Bounds
Propagated uncertainty margin:

$$m = \text{Total} \times \sqrt{\sum (w_i \cdot u_i)^2}$$

$$\text{P10} = \text{Total} - 1.28 \cdot m, \quad \text{P50} = \text{Total}, \quad \text{P90} = \text{Total} + 1.28 \cdot m$$

### C. Constrained Decarbonization Linear Solver Objective
$$\max \sum_{i=1}^{n} c_i \cdot x_i \quad \text{subject to} \quad \sum_{i=1}^{n} v_i \cdot x_i \le B_{\text{annual}}, \quad 0 \le x_i \le 1$$

Where $c_i$ is carbon saved and $v_i$ is implementation cost.
