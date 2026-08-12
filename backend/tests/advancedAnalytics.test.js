const test = require("node:test");
const assert = require("node:assert/strict");
const { forecastEmissions } = require("../services/forecastingEngine");
const { solveOptimalDecarbonization } = require("../services/optimizerEngine");
const { attributeAnomalySpike } = require("../services/anomalyAttribution");
const { getEmissionFactor } = require("../services/emissionFactorRegistry");
const { getMethodology } = require("../services/methodologyRegistry");
const { recordAuditEvent, getAuditTrail } = require("../services/auditTrail");
const { validateAndNormalizeActivity } = require("../services/ingestionValidator");
const { generateCalculationLineage } = require("../services/provenanceEngine");
const { calculateTargetGap } = require("../services/baselineManager");

test("Advanced AI / DS / DA & Provenance Engine Unit Tests", async (t) => {

    await t.test("getEmissionFactor should return versioned metadata and lifecycle status for factor ID", () => {
        const factor = getEmissionFactor("EPA_GRID_US_2023");
        assert.equal(factor.factor_id, "EPA_GRID_US_2023");
        assert.equal(factor.value, 0.385);
        assert.equal(factor.lifecycle_status, "Active");
        assert.equal(factor.approved_by, "ESG Compliance & Audit Board");
    });

    await t.test("getMethodology should return accounting boundary and methodology details", () => {
        const method = getMethodology("S1-MC-01");
        assert.equal(method.methodology_id, "S1-MC-01");
        assert.equal(method.scope, "Scope 1");
        assert.equal(method.ghg_category, "Mobile Combustion");
        assert.equal(method.accounting_boundary, "Operational Control Fleet Boundary");
    });

    await t.test("recordAuditEvent should log data mutation event with immutable userId and orgId", () => {
        const user = { userId: "usr_analyst_01", userEmail: "analyst@company.com", organizationId: "ORG-891" };
        const event = recordAuditEvent(user, "UPDATE_ELECTRICITY", 350, 370, "Invoice correction");
        assert.equal(event.userId, "usr_analyst_01");
        assert.equal(event.userEmail, "analyst@company.com");
        assert.equal(event.organizationId, "ORG-891");
        assert.equal(event.oldState, 350);
        assert.equal(event.newState, 370);
    });

    await t.test("calculateTargetGap should calculate baseline emissions and 2030 target gap", () => {
        const gap = calculateTargetGap(1000, 850, 50);
        assert.equal(gap.targetEmissionsKg, 500);
        assert.equal(gap.targetGapKg, 350);
        assert.equal(gap.progressPct, 30);
    });

    await t.test("validateAndNormalizeActivity should generate generic ActivityRecord array", () => {
        const input = { transportKm: 180, electricityKwh: 350, vehicleType: "gasoline" };
        const { normalizedInput, canonicalRecord } = validateAndNormalizeActivity(input);
        assert.equal(normalizedInput.transportKm, 180);
        assert.ok(canonicalRecord.records.length >= 3);
        assert.equal(canonicalRecord.records[0].methodologyId, "S1-MC-01");
    });

    await t.test("generateCalculationLineage should attach unique calculation ID, methodologies, and Evidence Store object", () => {
        const input = { vehicleType: "gasoline", region: "US", flightType: "short" };
        const scopeBreakdown = {
            totalKg: 200,
            scopes: { scope1: { kg: 50 }, scope2: { kg: 100 }, scope3: { kg: 50 } }
        };
        const lineage = generateCalculationLineage(input, scopeBreakdown);
        assert.ok(lineage.calculationId.startsWith("calc_"));
        assert.ok(lineage.evidenceStoreObject.evidenceId.startsWith("ev_"));
        assert.equal(lineage.evidenceStoreObject.totalKg, 200);
    });

    await t.test("forecastEmissions should generate 12 monthly projections and confidence bounds", () => {
        const result = forecastEmissions([], 200.0);
        assert.equal(result.forecastMonths.length, 12);
        assert.equal(result.asIsSeries.length, 12);
        assert.equal(result.targetSeries.length, 12);
        assert.equal(result.upperBounds.length, 12);
        assert.ok(result.outOfSampleTestMetrics.trainingMonths > 0);
        assert.ok(result.outOfSampleTestMetrics.testMonths > 0);
        assert.ok(result.historyStatus.fallbackMode !== undefined);
        assert.ok(result.annualProjectedAsIsKg > 0);
    });

    await t.test("solveOptimalDecarbonization should maximize carbon reduction within budget", () => {
        const result = solveOptimalDecarbonization(500, {
            breakdown: { transportKg: 200, electricityKg: 300, flightsKg: 100 }
        });
        assert.equal(result.annualBudget, 500);
        assert.ok(result.optimalDecisionVariables.evFleetAdoptionFraction >= 0);
        assert.ok(result.impact.netPercentReduced > 0);
    });

    await t.test("attributeAnomalySpike should isolate primary variance driver", () => {
        const current = { breakdown: { transportKg: 500, electricityKg: 100, flightsKg: 50 } };
        const history = [{ emissions: { breakdown: { transportKg: 100, electricityKg: 100, flightsKg: 50 } } }];
        const attribution = attributeAnomalySpike(current, history);
        assert.equal(attribution.primaryDriver, "Direct Driving & Fuel");
        assert.ok(attribution.varianceAttribution[0].percentage > 50);
    });
});
