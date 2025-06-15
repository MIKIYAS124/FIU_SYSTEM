const express = require("express")
const { AuthController } = require("../controllers/authController")
const { authenticate } = require("../middleware/auth")
const { handleValidationErrors } = require("../middleware/validation")
const { auditLog } = require("../middleware/audit")

const router = express.Router()

// Public routes
router.post("/login", AuthController.loginValidation, handleValidationErrors, auditLog("LOGIN"), AuthController.login)

router.post(
  "/forgot-password",
  AuthController.forgotPasswordValidation,
  handleValidationErrors,
  AuthController.forgotPassword,
)

router.post(
  "/reset-password",
  AuthController.resetPasswordValidation,
  handleValidationErrors,
  auditLog("PASSWORD_RESET"),
  AuthController.resetPassword,
)

router.post("/refresh-token", AuthController.refreshToken)

// Protected routes
router.post("/logout", authenticate, auditLog("LOGOUT"), AuthController.logout)
router.get("/me", authenticate, AuthController.getCurrentUser)

module.exports = router
