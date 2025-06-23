const express = require("express")
const { body, validationResult } = require("express-validator")
const { createReport, getReports, getReport, updateReport, deleteReport } = require("../controllers/reportController")
const { authenticate } = require("../middleware/auth")

const router = express.Router()

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// All routes require authentication
router.use(authenticate)

// Create report
router.post(
  "/",
  [
    body("transaction_date").isISO8601().withMessage("Valid transaction date is required"),
    body("transaction_amount").isNumeric().withMessage("Valid transaction amount is required"),
    body("account_number").notEmpty().withMessage("Account number is required"),
    body("account_holder_name").notEmpty().withMessage("Account holder name is required"),
    body("suspicious_activity")
      .isLength({ min: 10 })
      .withMessage("Suspicious activity description must be at least 10 characters"),
  ],
  validateRequest,
  createReport,
)

// Get all reports
router.get("/", getReports)

// Get single report
router.get("/:id", getReport)

// Update report
router.put(
  "/:id",
  [
    body("transaction_date").optional().isISO8601().withMessage("Valid transaction date is required"),
    body("transaction_amount").optional().isNumeric().withMessage("Valid transaction amount is required"),
    body("account_number").optional().notEmpty().withMessage("Account number cannot be empty"),
    body("account_holder_name").optional().notEmpty().withMessage("Account holder name cannot be empty"),
    body("suspicious_activity")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Suspicious activity description must be at least 10 characters"),
  ],
  validateRequest,
  updateReport,
)

// Delete report
router.delete("/:id", deleteReport)

module.exports = router
