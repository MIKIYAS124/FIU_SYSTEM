const { AuthUtils } = require("../utils/auth")
const { ResponseHelper } = require("../utils/response")
const { logger } = require("../utils/logger")

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseHelper.unauthorized(res, "No token provided")
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = AuthUtils.verifyToken(token)

    // Get active session
    const session = await AuthUtils.getActiveSession(decoded.sessionId)

    if (!session) {
      return ResponseHelper.unauthorized(res, "Invalid or expired session")
    }

    if (!session.user.isActive) {
      return ResponseHelper.unauthorized(res, "Account is deactivated")
    }

    // Update session last accessed
    await AuthUtils.updateSessionAccess(decoded.sessionId)

    // Attach user to request
    req.user = session.user
    req.sessionId = decoded.sessionId

    next()
  } catch (error) {
    logger.error("Authentication error", { error: error.message })
    return ResponseHelper.unauthorized(res, "Invalid token")
  }
}

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "Authentication required")
    }

    if (!roles.includes(req.user.role)) {
      logger.warn("Authorization failed", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
      })
      return ResponseHelper.forbidden(res, "Insufficient permissions")
    }

    next()
  }
}

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = AuthUtils.verifyToken(token)
      const session = await AuthUtils.getActiveSession(decoded.sessionId)

      if (session && session.user.isActive) {
        req.user = session.user
        req.sessionId = decoded.sessionId
        await AuthUtils.updateSessionAccess(decoded.sessionId)
      }
    }

    next()
  } catch (error) {
    // Ignore errors for optional auth
    next()
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
}
