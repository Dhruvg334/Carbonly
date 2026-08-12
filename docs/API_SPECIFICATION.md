# Carbonly REST API Specification

## 1. Overview & Multi-Tenant Security
All API requests require a valid JSON Web Token (JWT) passed in the HTTP `Authorization` header (`Bearer <token>`). The API enforces **multi-tenant authorization**: requests containing an `x-organization-id` header or body parameter are validated against the user's token claims (`organizationId`). Unauthorized cross-tenant requests return `403 Forbidden`.

---

## 2. Endpoints Reference

### A. Calculate Carbon Footprints
- **HTTP Method**: `POST`
- **Path**: `/api/carbon/calculate`
- **Headers**:
  ```http
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  x-organization-id: ORG-ENTERPRISE-891
  ```
- **Request Body**:
  ```json
  {
    "transportKm": 180,
    "vehicleType": "gasoline",
    "electricityKwh": 350,
    "region": "US",
    "flightsTaken": 1,
    "flightType": "short",
    "waterLiters": 1200,
    "screenHours": 160,
    "internetGb": 450,
    "organizationId": "ORG-ENTERPRISE-891",
    "facilityId": "FAC-NORTH-AMERICA"
  }
  ```
- **Response Schema**:
  ```json
  {
    "status": "success",
    "data": {
      "totalKg": 205.8,
      "totalTonnes": 0.2058,
      "scopes": {
        "scope1": { "kg": 34.56, "percentage": 16.8 },
        "scope2": { "kg": 134.75, "percentage": 65.5 },
        "scope3": { "kg": 36.49, "percentage": 17.7 }
      },
      "ecoScore": { "scorePoints": 920, "starRating": 5 },
      "anomalyReport": { "isAnomaly": false, "zScore": "0.42" },
      "auditLineage": {
        "calculationId": "calc_83a91f",
        "dataQuality": { "overallConfidenceScorePct": 95.0, "propagatedUncertaintyPct": 4.2 },
        "evidenceStoreObject": {
          "evidenceId": "ev_9401ab",
          "claim": "Total carbon footprint is 205.80 kg CO2e dominated by Scope 2 electricity draw.",
          "activityRecordIds": ["act_01", "act_02", "act_03"],
          "methodologyId": "S2-LOC-01",
          "methodologyVersion": "2.0",
          "factorVersion": "1.0",
          "formula": "Emissions = ActivityQuantity x EmissionFactor x RadiativeForcingMultiplier"
        }
      },
      "executiveSummary": "Activity footprint totals 205.80 kg CO2e dominated by grid power draw."
    }
  }
  ```

### B. Export Audit-Ready ESG Report
- **HTTP Method**: `GET`
- **Path**: `/api/carbon/export-report`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: Triggers an automated download of `Carbonly_ESG_Audit_Report.md`.
