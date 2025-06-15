const { prisma } = require("../utils/database")
const { logger } = require("../utils/logger")

// Audit logging middleware
const auditLog = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send

    res.send = function (data) {
      // Log the audit trail
      setImmediate(async () => {
        try {
          const auditData = {
            userId: req.user?.id || null,
            action,
            tableName: req.params.resource || "unknown",
            recordId: req.params.id || null,
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          }

          // Add request data for create/update operations
          if (["CREATE", "UPDATE"].includes(action)) {
            auditData.newValues = req.body
          }

          await prisma.auditLog.create({ data: auditData })
        } catch (error) {
          logger.error("Audit logging failed", { error: error.message })
        }
      })

      originalSend.call(this, data)
    }

    next()
  }
}

module.exports = {
  auditLog,
}
