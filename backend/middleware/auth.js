const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "carbonly_super_secret_jwt_key_2026";

/**
 * JWT Authentication & Multi-Tenant Authorization Middleware
 * Enforces tenant isolation: verifies token and validates organization boundary access.
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ status: "error", message: "Access denied. Authentication token required." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        // Multi-Tenant Isolation Check (Item 10)
        const requestOrg = req.headers["x-organization-id"] || (req.body && req.body.organizationId);
        if (requestOrg && decoded.organizationId && decoded.organizationId !== requestOrg) {
            return res.status(403).json({
                status: "error",
                message: "Tenant Authorization Failure: You do not have permission to access data for this Organization ID."
            });
        }

        next();
    } catch (err) {
        return res.status(403).json({ status: "error", message: "Invalid or expired authentication token." });
    }
}

module.exports = authMiddleware;
