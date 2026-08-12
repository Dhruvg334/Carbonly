/**
 * Carbonly Audit Trail & Data Mutation Log Engine
 * Logs immutable data mutation events (userId -> organizationId -> Action -> Old State -> New State -> Reason -> Timestamp).
 */

const auditLogStore = [];

function recordAuditEvent(userObj, action, oldState, newState, reason, affectedCalcId) {
    const user = typeof userObj === "object" ? userObj : { userId: "usr_analyst_01", userEmail: String(userObj) };

    const event = {
        eventId: "audit_" + Math.random().toString(36).substring(2, 9),
        userId: user.userId || "usr_analyst_01",
        userEmail: user.userEmail || "analyst@company.com",
        organizationId: user.organizationId || "ORG-ENTERPRISE-891",
        role: user.role || "Sustainability Analyst",
        sessionId: user.sessionId || "sess_9401ab",
        action,
        oldState,
        newState,
        reason: reason || "Data correction / utility invoice update",
        timestamp: new Date().toISOString(),
        affectedCalcId: affectedCalcId || null
    };

    auditLogStore.push(event);
    return event;
}

function getAuditTrail(filterOrgId) {
    if (filterOrgId) {
        return auditLogStore.filter(e => e.organizationId === filterOrgId);
    }
    return [...auditLogStore];
}

module.exports = {
    recordAuditEvent,
    getAuditTrail
};
