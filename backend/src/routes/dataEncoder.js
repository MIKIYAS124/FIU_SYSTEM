const express = require("express")
const { body, param, query } = require("express-validator")
const dataEncoderController = require("../controllers/dataEncoderController")
const { authenticateToken, requireRole } = require("../middleware/auth")
const fileUploadService = require("../services/fileUploadService")

const router = express.Router()

// Apply authentication and role check to all routes
router.use(authenticateToken)
router.use(requireRole(["DATA_ENCODER", "INTERMEDIATE_ADMIN", "SUPER_ADMIN"]))

// Dashboard
router.get("/dashboard", dataEncoderController.getDashboard)

// STR Report Routes
router.post(
  "/str-reports",
  [
    body("transactionDate").isISO8601().withMessage("Valid transaction date is required"),
    body("transactionAmount").isFloat({ min: 0 }).withMessage("Valid transaction amount is required"),
    body("transactionCurrency").isLength({ min: 3, max: 3 }).withMessage("Valid currency code is required"),
    body("transactionMannerId").isInt({ min: 1 }).withMessage("Transaction manner is required"),
    body("crimeTypeId").isInt({ min: 1 }).withMessage("Crime type is required"),
    body("accountNumber").notEmpty().withMessage("Account number is required"),
    body("accountHolderName").notEmpty().withMessage("Account holder name is required"),
    body("accountHolderIdType")
      .isIn(["PASSPORT", "NATIONAL_ID", "DRIVING_LICENSE", "OTHER"])
      .withMessage("Valid ID type is required"),
    body("accountHolderIdNumber").notEmpty().withMessage("Account holder ID number is required"),
    body("personReportedName").notEmpty().withMessage("Person reported name is required"),
    body("suspiciousActivityDescription")
      .isLength({ min: 10 })
      .withMessage("Suspicious activity description must be at least 10 characters"),
  ],
  dataEncoderController.createSTRReport,
)

router.get(
  "/str-reports",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "RETURNED"])
      .withMessage("Invalid status"),
    query("dateFrom").optional().isISO8601().withMessage("Valid date format required"),
    query("dateTo").optional().isISO8601().withMessage("Valid date format required"),
  ],
  dataEncoderController.getSTRReports,
)

router.get(
  "/str-reports/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid report ID is required")],
  dataEncoderController.getSTRReportById,
)

router.put(
  "/str-reports/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("Valid report ID is required"),
    body("transactionDate").optional().isISO8601().withMessage("Valid transaction date is required"),
    body("transactionAmount").optional().isFloat({ min: 0 }).withMessage("Valid transaction amount is required"),
    body("transactionCurrency").optional().isLength({ min: 3, max: 3 }).withMessage("Valid currency code is required"),
    body("suspiciousActivityDescription")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Suspicious activity description must be at least 10 characters"),
  ],
  dataEncoderController.updateSTRReport,
)

router.post(
  "/str-reports/:id/submit",
  [param("id").isInt({ min: 1 }).withMessage("Valid report ID is required")],
  dataEncoderController.submitSTRReport,
)

router.delete(
  "/str-reports/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid report ID is required")],
  dataEncoderController.deleteSTRReport,
)

// CTR Report Routes
router.post(
  "/ctr-reports",
  [
    body("transactionDate").isISO8601().withMessage("Valid transaction date is required"),
    body("transactionAmount").isFloat({ min: 0 }).withMessage("Valid transaction amount is required"),
    body("transactionCurrency").isLength({ min: 3, max: 3 }).withMessage("Valid currency code is required"),
    body("transactionType")
      .isIn(["CASH_DEPOSIT", "CASH_WITHDRAWAL", "WIRE_TRANSFER", "CHECK_DEPOSIT", "OTHER"])
      .withMessage("Valid transaction type is required"),
    body("accountNumber").notEmpty().withMessage("Account number is required"),
    body("accountHolderName").notEmpty().withMessage("Account holder name is required"),
    body("accountHolderIdType")
      .isIn(["PASSPORT", "NATIONAL_ID", "DRIVING_LICENSE", "OTHER"])
      .withMessage("Valid ID type is required"),
    body("accountHolderIdNumber").notEmpty().withMessage("Account holder ID number is required"),
    body("transactionDescription")
      .isLength({ min: 10 })
      .withMessage("Transaction description must be at least 10 characters"),
  ],
  dataEncoderController.createCTRReport,
)

router.get(
  "/ctr-reports",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "RETURNED"])
      .withMessage("Invalid status"),
    query("dateFrom").optional().isISO8601().withMessage("Valid date format required"),
    query("dateTo").optional().isISO8601().withMessage("Valid date format required"),
  ],
  dataEncoderController.getCTRReports,
)

router.get(
  "/ctr-reports/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid report ID is required")],
  dataEncoderController.getCTRReportById,
)

router.post(
  "/ctr-reports/:id/submit",
  [param("id").isInt({ min: 1 }).withMessage("Valid report ID is required")],
  dataEncoderController.submitCTRReport,
)

router.delete(
  "/ctr-reports/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid report ID is required")],
  dataEncoderController.deleteCTRReport,
)

// File Upload Routes
router.post(
  "/reports/:reportId/:reportType/files",
  [
    param("reportId").isInt({ min: 1 }).withMessage("Valid report ID is required"),
    param("reportType").isIn(["str", "ctr"]).withMessage("Report type must be 'str' or 'ctr'"),
  ],
  fileUploadService.getMulterConfig().array("files", 10),
  dataEncoderController.uploadFiles,
)

router.get(
  "/reports/:reportId/:reportType/files",
  [
    param("reportId").isInt({ min: 1 }).withMessage("Valid report ID is required"),
    param("reportType").isIn(["str", "ctr"]).withMessage("Report type must be 'str' or 'ctr'"),
  ],
  dataEncoderController.getReportFiles,
)

router.get(
  "/files/:fileId/download",
  [param("fileId").isInt({ min: 1 }).withMessage("Valid file ID is required")],
  dataEncoderController.downloadFile,
)

router.delete(
  "/files/:fileId",
  [param("fileId").isInt({ min: 1 }).withMessage("Valid file ID is required")],
  dataEncoderController.deleteFile,
)

// Bulk Operations
router.post(
  "/reports/bulk-submit",
  [
    body("reportIds").isArray({ min: 1 }).withMessage("Report IDs array is required"),
    body("reportIds.*").isInt({ min: 1 }).withMessage("Each report ID must be a positive integer"),
    body("reportType").isIn(["STR", "CTR"]).withMessage("Report type must be 'STR' or 'CTR'"),
  ],
  dataEncoderController.bulkSubmitReports,
)

module.exports = router
