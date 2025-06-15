const { prisma } = require("../utils/database")
const { AuthUtils } = require("../utils/auth")
const { logger } = require("../utils/logger")
const crypto = require("crypto")

class AuthService {
  // User login
  static async login(username, password, ipAddress, userAgent) {
    try {
      // Find user by username or email
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username: username }, { email: username }],
          isActive: true,
        },
      })

      if (!user) {
        throw new Error("Invalid credentials")
      }

      // Verify password
      const isValidPassword = await AuthUtils.comparePassword(password, user.passwordHash)

      if (!isValidPassword) {
        throw new Error("Invalid credentials")
      }

      // Generate session token
      const sessionToken = crypto.randomUUID()

      // Create JWT payload
      const jwtPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        sessionId: sessionToken,
      }

      // Generate tokens
      const { accessToken, refreshToken } = AuthUtils.generateTokens(jwtPayload)

      // Create session
      await AuthUtils.createSession(user.id, sessionToken, refreshToken, ipAddress, userAgent)

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })

      // Return user data (without password)
      const { passwordHash, ...userData } = user

      logger.info("User logged in", { userId: user.id, username: user.username })

      return {
        user: userData,
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      }
    } catch (error) {
      logger.error("Login failed", { username, error: error.message })
      throw error
    }
  }

  // User logout
  static async logout(sessionToken) {
    try {
      await AuthUtils.invalidateSession(sessionToken)
      logger.info("User logged out", { sessionToken })
    } catch (error) {
      logger.error("Logout failed", { sessionToken, error: error.message })
      throw error
    }
  }

  // Refresh token
  static async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = AuthUtils.verifyToken(refreshToken, true)

      // Find session
      const session = await prisma.userSession.findFirst({
        where: {
          refreshToken,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      })

      if (!session || !session.user.isActive) {
        throw new Error("Invalid refresh token")
      }

      // Generate new tokens
      const newSessionToken = crypto.randomUUID()
      const jwtPayload = {
        userId: session.user.id,
        username: session.user.username,
        role: session.user.role,
        sessionId: newSessionToken,
      }

      const { accessToken, refreshToken: newRefreshToken } = AuthUtils.generateTokens(jwtPayload)

      // Update session
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          sessionToken: newSessionToken,
          refreshToken: newRefreshToken,
          lastAccessed: new Date(),
        },
      })

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 24 * 60 * 60,
      }
    } catch (error) {
      logger.error("Token refresh failed", { error: error.message })
      throw error
    }
  }

  // Request password reset
  static async requestPasswordReset(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email, isActive: true },
      })

      if (!user) {
        // Don't reveal if email exists
        return { message: "If the email exists, a reset link has been sent" }
      }

      // Generate reset token
      const resetToken = AuthUtils.generateResetToken()
      const resetExpires = new Date()
      resetExpires.setHours(resetExpires.getHours() + Number.parseInt(process.env.PASSWORD_RESET_EXPIRES_HOURS || "1"))

      // Save reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        },
      })

      logger.info("Password reset requested", { userId: user.id, email })

      // TODO: Send email with reset link
      // await emailService.sendPasswordResetEmail(user.email, resetToken);

      return {
        message: "Password reset link sent to your email",
        resetToken, // Remove this in production
      }
    } catch (error) {
      logger.error("Password reset request failed", { email, error: error.message })
      throw error
    }
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
          isActive: true,
        },
      })

      if (!user) {
        throw new Error("Invalid or expired reset token")
      }

      // Hash new password
      const hashedPassword = await AuthUtils.hashPassword(newPassword)

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      })

      // Invalidate all sessions for this user
      await prisma.userSession.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      })

      logger.info("Password reset completed", { userId: user.id })

      return { message: "Password reset successfully" }
    } catch (error) {
      logger.error("Password reset failed", { token, error: error.message })
      throw error
    }
  }

  // Get current user
  static async getCurrentUser(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
      })

      if (!user) {
        throw new Error("User not found")
      }

      return user
    } catch (error) {
      logger.error("Get current user failed", { userId, error: error.message })
      throw error
    }
  }
}

module.exports = { AuthService }
