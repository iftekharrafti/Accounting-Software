const db = require('../models');

/**
 * Audit Logger Middleware
 * Logs all actions for audit trail
 */
const auditLogger = (action, module) => {
    return async (req, res, next) => {
        // Store original response methods
        const originalJson = res.json.bind(res);

        // Override res.json to capture response
        res.json = function (data) {
            // Only log successful operations
            if (data.success && req.user) {
                // Capture request and response data for logging
                const logData = {
                    profileId: req.profileId || null,
                    userId: req.userId,
                    action: action,
                    module: module,
                    recordType: module,
                    recordId: data.data?.id || req.params.id || null,
                    description: `${action} ${module}`,
                    oldValues: req.oldValues || null,
                    newValues: data.data || null,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    timestamp: new Date(),
                    metadata: {
                        method: req.method,
                        url: req.originalUrl,
                        body: req.body,
                        params: req.params,
                        query: req.query
                    }
                };

                // Create audit log asynchronously (don't wait for it)
                db.AuditLog.create(logData).catch(err => {
                    console.error('Audit log creation failed:', err.message);
                });
            }

            // Call original json method
            return originalJson(data);
        };

        next();
    };
};

/**
 * Create Audit Log Helper
 */
const createAuditLog = async (data) => {
    try {
        await db.AuditLog.create(data);
    } catch (error) {
        console.error('Audit log creation failed:', error.message);
    }
};

module.exports = {
    auditLogger,
    createAuditLog
};