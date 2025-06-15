const express = require("express")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { auditLog } = require("../middleware/audit")
const intermediateAdminController = require("../controllers/intermediateAdminController")
const { body, param, query } = require("express-validator")

const router = express.Router()

// Apply authentication and role check to all routes
router.use(authenticateToken)
router.use(requireRole(["INTERMEDIATE_ADMIN"]))

// Dashboard
router.get("/dashboard", intermediateAdminController.getDashboard)

// Branch Management Routes
router.post(
  "/branches",
  [
    body("branchName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Branch name must be between 2 and 100 characters"),
    body("branchCode")
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage("Branch code must be between 2 and 20 characters"),
    body("reportingEntityId").isInt({ min: 1 }).withMessage("Valid reporting entity ID is required"),
    body("address").trim().isLength({ min: 5, max: 255 }).withMessage("Address must be between 5 and 255 characters"),
    body("city").trim().isLength({ min: 2, max: 50 }).withMessage("City must be between 2 and 50 characters"),
    body("region").trim().isLength({ min: 2, max: 50 }).withMessage("Region must be between 2 and 50 characters"),
    body("country").trim().isLength({ min: 2, max: 50 }).withMessage("Country must be between 2 and 50 characters"),
    body("phoneNumber")
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage("Phone number must be between 10 and 20 characters"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("managerName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Manager name must be between 2 and 100 characters"),
    body("managerPhone")
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage("Manager phone must be between 10 and 20 characters"),
    body("managerEmail").optional().isEmail().normalizeEmail().withMessage("Valid manager email is required"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  ],
  validateRequest,
  auditLog("CREATE", "branches"),
  intermediateAdminController.createBranch,
)

router.get(
  "/branches",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().trim().isLength({ max: 100 }).withMessage("Search term must not exceed 100 characters"),
    query("region").optional().trim().isLength({ max: 50 }).withMessage("Region must not exceed 50 characters"),
    query("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
    query("sortBy")
      .optional()
      .isIn(["branch_name", "branch_code", "city", "region", "created_at", "updated_at"])
      .withMessage("Invalid sort field"),
    query("sortOrder").optional().isIn(["ASC", "DESC"]).withMessage("Sort order must be ASC or DESC"),
  ],
  validateRequest,
  intermediateAdminController.getBranches,
)

router.get(
  "/branches/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid branch ID is required")],
  validateRequest,
  intermediateAdminController.getBranch,
)

router.put(
  "/branches/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("Valid branch ID is required"),
    body("branchName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Branch name must be between 2 and 100 characters"),
    body("branchCode")
      .optional()
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage("Branch code must be between 2 and 20 characters"),
    body("address")
      .optional()
      .trim()
      .isLength({ min: 5, max: 255 })
      .withMessage("Address must be between 5 and 255 characters"),
    body("city")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("City must be between 2 and 50 characters"),
    body("region")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Region must be between 2 and 50 characters"),
    body("phoneNumber")
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage("Phone number must be between 10 and 20 characters"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("managerName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Manager name must be between 2 and 100 characters"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  ],
  validateRequest,
  auditLog("UPDATE", "branches"),
  intermediateAdminController.updateBranch,
)

router.delete(
  "/branches/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid branch ID is required")],
  validateRequest,
  auditLog("DELETE", "branches"),
  intermediateAdminController.deleteBranch,
)

router.get(
  "/branches/:id/statistics",
  [param("id").isInt({ min: 1 }).withMessage("Valid branch ID is required")],
  validateRequest,
  intermediateAdminController.getBranchStatistics,
)

// Data Encoder Management Routes
router.post(
  "/data-encoders",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username must be 3-50 characters and contain only letters, numbers, and underscores"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("fullName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),
    body("phoneNumber")
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage("Phone number must be between 10 and 20 characters"),
    body("branchId").isInt({ min: 1 }).withMessage("Valid branch ID is required"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
    body("sendCredentials").optional().isBoolean().withMessage("sendCredentials must be a boolean"),
  ],
  validateRequest,
  auditLog("CREATE", "users"),
  intermediateAdminController.createDataEncoder,
)

router.get(
  "/data-encoders",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().trim().isLength({ max: 100 }).withMessage("Search term must not exceed 100 characters"),
    query("branchId").optional().isInt({ min: 1 }).withMessage("Valid branch ID is required"),
    query("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
    query("sortBy")
      .optional()
      .isIn(["full_name", "username", "email", "created_at", "last_login_at"])
      .withMessage("Invalid sort field"),
    query("sortOrder").optional().isIn(["ASC", "DESC"]).withMessage("Sort order must be ASC or DESC"),
  ],
  validateRequest,
  intermediateAdminController.getDataEncoders,
)

router.put(
  "/data-encoders/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("Valid user ID is required"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("fullName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),
    body("phoneNumber")
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage("Phone number must be between 10 and 20 characters"),
    body("branchId").optional().isInt({ min: 1 }).withMessage("Valid branch ID is required"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  ],
  validateRequest,
  auditLog("UPDATE", "users"),
  intermediateAdminController.updateDataEncoder,
)

router.post(
  "/data-encoders/:id/reset-password",
  [param("id").isInt({ min: 1 }).withMessage("Valid user ID is required")],
  validateRequest,
  auditLog("PASSWORD_RESET", "users"),
  intermediateAdminController.resetDataEncoderPassword,
)

module.exports = router
