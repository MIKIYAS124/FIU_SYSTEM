const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const { prisma } = require("./database")

class AuthUtils {
  // Generate JWT tokens
  static generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    })

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    })

    return { accessToken, refreshToken }
  }

  // Verify JWT token
  static verifyToken(token, isRefresh = false) {
    try {
      const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET
      return jwt.verify(token, secret)
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  // Hash password
  static async hashPassword(password) {
    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
    return await bcrypt.hash(password, saltRounds)
  }

  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
  }

  // Generate password reset token
  static generateResetToken() {
    return crypto.randomBytes(32).toString("hex")
  }

  // Create user session
  static async createSession(userId, sessionToken, refreshToken, ipAddress, userAgent) {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + Number.parseInt(process.env.SESSION_TIMEOUT_HOURS || "24"))

    return await prisma.userSession.create({
      data: {
        userId,
        sessionToken,
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    })
  }

  // Get active session
  static async getActiveSession(sessionToken) {
    return await prisma.userSession.findFirst({
      where: {
        sessionToken,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            middleName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    })
  }

  // Invalidate session
  static async invalidateSession(sessionToken) {
    return await prisma.userSession.updateMany({
      where: { sessionToken },
      data: { isActive: false },
    })
  }

  // Clean expired sessions
  static async cleanExpiredSessions() {
    return await prisma.userSession.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isActive: false }],
      },
    })
  }

  // Update session last accessed
  static async updateSessionAccess(sessionToken) {
    return await prisma.userSession.update({
      where: { sessionToken },
      data: { lastAccessed: new Date() },
    })
  }
}

module.exports = { AuthUtils }
