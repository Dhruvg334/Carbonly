# Carbonly REST API Specification

## 1. Auth Endpoints
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate user and receive JWT bearer token.

## 2. Carbon Analytics Endpoints
- `POST /api/carbon/calculate`: Compute Scope 1, 2, 3 emissions, EcoScore, Z-score anomalies, 12-month forecast, and Groq AI brief. Requires Bearer Token.
- `POST /api/carbon/simulate`: Execute sensitivity simulations for scenario parameters.
- `POST /api/carbon/optimize`: Solves linear programming optimization problem for target budget limit.
- `POST /api/carbon/ai-copilot`: Interactive Groq AI Q&A assistant query endpoint.
- `GET /api/carbon/history`: Retrieve historical emissions time-series logs.
- `GET /api/carbon/export-report`: Export formal Markdown ESG Audit Certificate.
