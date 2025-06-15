const express = require("express")
const { body, param, query } = require("express-validator")
const workflowController = require("../controllers/workflowController")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Get reports for review (Super Admin and Intermediate Admin only)
router.get(
  "/reports/review",
  requireRole(["SUPER_ADMIN", "INTERMEDIATE_ADMIN"]),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status").optional().isIn(["SUBMITTED", "APPROVED", "REJECTED", "RETURNED"]).withMessage("Invalid status"),
    query("reportType").optional().isIn(["STR", "CTR"]).withMessage("Report type must be 'STR' or 'CTR'"),
    query("dateFrom").optional().isISO8601().withMessage("Valid date format required"),
    query("dateTo").optional().isISO8601().withMessage("Valid date format required"),
  ],
  workflowController.getReportsForReview,
)

// Approve report
router.post(
  "/reports/:reportId/:reportType/approve",
  requireRole(["SUPER_ADMIN", "INTERMEDIATE_ADMIN"]),
  [
    param("reportId").isInt({ min: 1 }).withMessage("Valid report ID is required"),
    param("reportType").isIn(["str", "ctr"]).withMessage("Report type must be 'str' or 'ctr'"),
    body("comments").optional().isLength({ max: 1000 }).withMessage("Comments must be less than 1000 characters"),
  ],
  workflowController.approveReport,
)

// Reject report
router.post(
  "/reports/:reportId/:reportType/reject",
  requireRole(["SUPER_ADMIN", "INTERMEDIATE_ADMIN"]),
  [
    param("reportId").isInt({ min: 1 }).withMessage("Valid report ID is required"),
    param("reportType").isIn(["str", "ctr"]).withMessage("Report type must be 'str' or 'ctr'"),
    body("rejectionReason")
      .notEmpty()
      .withMessage("Rejection reason is required")
      .isLength({ max: 1000 })
      .withMessage("Rejection reason must be less than 1000 characters"),
  ],
  workflowController.rejectReport,
)

// Return report for revision
router.post(
  "/reports/:reportId/:reportType/return",
  requireRole(["SUPER_ADMIN", "INTERMEDIATE_ADMIN"]),
  [
    param("reportId").isInt({ min: 1 }).withMessage("Valid report ID is required"),
    param("reportType").isIn(["str", "ctr"]).withMessage("Report type must be 'str' or 'ctr'"),
    body("revisionNotes")
      .notEmpty()
      .withMessage("Revision notes are required")
      .isLength({ max: 1000 })
      .withMessage("Revision notes must be less than 1000 characters"),
  ],
  workflowController.returnReportForRevision,
)

// Get workflow history
router.get(
  "/reports/:reportId/:reportType/history",
  [
    param("reportId").isInt({ min: 1 }).withMessage("Valid report ID is required"),
    param("reportType").isIn(["str", "ctr"]).withMessage("Report type must be 'str' or 'ctr'"),
  ],
  workflowController.getWorkflowHistory,
)

// Get report statistics
router.get(
  "/statistics",
  requireRole(["SUPER_ADMIN", "INTERMEDIATE_ADMIN"]),
  [query("dateRange").optional().isInt({ min: 1, max: 365 }).withMessage("Date range must be between 1 and 365 days")],
  workflowController.getReportStatistics,
)

module.exports = router
