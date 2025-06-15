const { body } = require("express-validator")
const { AuthService } = require("../services/authService")
const { ResponseHelper } = require("../utils/response")
const { handleValidationErrors } = require("../middleware/validation")
const { logger } = require("../utils/logger")

class AuthController {
  // Login validation rules
  static loginValidation = [
    body("username")
      .notEmpty()
      .withMessage("Username or email is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ]

  // Password reset request validation
  static forgotPasswordValidation = [body("email").isEmail().withMessage("Valid email is required").normalizeEmail()]

  // Password reset validation
  static resetPasswordValidation = [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  ]

  // Login
  static async login(req, res) {
    try {
      const { username, password } = req.body
      const ipAddress = req.ip
      const userAgent = req.get("User-Agent")

      const result = await AuthService.login(username, password, ipAddress, userAgent)

      ResponseHelper.success(res, "Login successful", result)
    } catch (error) {
      logger.error("Login controller error", { error: error.message })
      ResponseHelper.error(res, error.message, null, 401)
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      await AuthService.logout(req.sessionId)
      ResponseHelper.success(res, "Logout successful")
    } catch (error) {
      logger.error("Logout controller error", { error: error.message })
      ResponseHelper.error(res, "Logout failed")
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return ResponseHelper.error(res, "Refresh token is required", null, 400)
      }

      const result = await AuthService.refreshToken(refreshToken)
      ResponseHelper.success(res, "Token refreshed successfully", result)
    } catch (error) {
      logger.error("Refresh token controller error", { error: error.message })
      ResponseHelper.error(res, error.message, null, 401)
    }
  }

  // Forgot password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body
      const result = await AuthService.requestPasswordReset(email)
      ResponseHelper.success(res, result.message, { resetToken: result.resetToken })
    } catch (error) {
      logger.error("Forgot password controller error", { error: error.message })
      ResponseHelper.error(res, "Failed to process password reset request")
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body
      const result = await AuthService.resetPassword(token, newPassword)
      ResponseHelper.success(res, result.message)
    } catch (error) {
      logger.error("Reset password controller error", { error: error.message })
      ResponseHelper.error(res, error.message, null, 400)
    }
  }

  // Get current user
  static async getCurrentUser(req, res) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id)
      ResponseHelper.success(res, "User retrieved successfully", user)
    } catch (error) {
      logger.error("Get current user controller error", { error: error.message })
      ResponseHelper.error(res, error.message, null, 404)
    }
  }
}

module.exports = { AuthController }
