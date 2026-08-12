/**
 * Carbonly Audit Trail & Data Mutation Log Engine
 * Logs data mutations (User -> Action -> Old State -> New State -> Reason -> Timestamp).
 */

const auditLogStore = [];

function recordAuditEvent(userEmail, action, oldState, newState, reason, affectedCalcId) {
    const event = {
        eventId: "audit_" + Math.random().toString(36).substring(2, 9),
        userEmail: userEmail || "system_analyst@carbonly.io",
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

function getAuditTrail(filterEmail) {
    if (filterEmail) {
        return auditLogStore.filter(e => e.userEmail === filterEmail);
    }
    return [...auditLogStore];
}

module.exports = {
    recordAuditEvent,
    getAuditTrail
};
