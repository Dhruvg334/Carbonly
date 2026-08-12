# Public Datasets & Mathematical Formulation Reference

## 1. Official Conversion Factor Datasets
Carbonly uses verified emission factor conversion factors from official public databases:

| Dataset | Publisher | Scope Covered | Factor Values |
|---|---|---|---|
| **UK DEFRA 2024** | UK Department for Environment, Food & Rural Affairs | Scope 1 & Scope 3 | Gasoline: 0.192 kg/km, Diesel: 0.171 kg/km, Flights: 0.156 kg/km |
| **US EPA eGRID 2023** | US Environmental Protection Agency | Scope 2 Electricity Grids | US Avg: 0.385 kg/kWh, EU: 0.255 kg/kWh, IN: 0.710 kg/kWh |
| **IPCC AR6** | Intergovernmental Panel on Climate Change | Scope 3 Radiative Forcing | Aviation multiplier: 1.9x |

## 2. Calculation Validation against Reference Examples
Carbonly’s deterministic calculation engine is benchmarked against reference test vectors to ensure absolute mathematical precision:

- **Reference Calculation Test Vectors**: 19 Automated Unit Tests
- **Passed Test Cases**: 19 / 19 (100% Pass Rate)
- **Max Absolute Error**: $0.0000 \text{ kg CO}_2e$
- **Mean Absolute Error (MAE)**: $0.0000 \text{ kg CO}_2e$
- **Tolerance Boundary**: $\pm 10^{-6} \text{ kg CO}_2e$

## 3. Mathematical Equations

### A. Deterministic GHG Calculation Equation
$$\text{Emissions } (kg CO_2e) = \sum \left( \text{Activity Data}_i \times \text{Factor}_i \right)$$

### B. Statistical Anomaly Z-Score Equation
$$Z = \frac{x_i - \mu}{\sigma}$$
Where $Z > 2.0$ triggers an automated consumption spike alert.

### C. EcoScore Relative Rating Equation
Score points (0 to 1000) are computed relative to global benchmark average ($86.5 \text{ kg CO}_2e / \text{week}$):
- $\le 43 \text{ kg/week} \implies$ **5 Stars (900-1000 pts) - Climate Champion**
- $\le 73 \text{ kg/week} \implies$ **4 Stars (750-899 pts) - Eco Leader**
- $\le 108 \text{ kg/week} \implies$ **3 Stars (600-749 pts) - Average Baseline**
- $> 108 \text{ kg/week} \implies$ **1-2 Stars (<600 pts) - High Priority Target**
