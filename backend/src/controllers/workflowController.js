const workflowService = require("../services/workflowService")
const { ResponseHelper } = require("../utils/response")
const { logger } = require("../utils/logger")
const { validationResult } = require("express-validator")

class WorkflowController {
  // Get reports for review
  async getReportsForReview(req, res) {
    try {
      const userId = req.user.id
      const filters = req.query

      const result = await workflowService.getReportsForReview(userId, filters)

      ResponseHelper.success(res, "Reports for review retrieved successfully", result)
    } catch (error) {
      logger.error("Error fetching reports for review", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to fetch reports for review")
    }
  }

  // Approve report
  async approveReport(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.validationError(res, "Validation failed", errors.array())
      }

      const { reportId, reportType } = req.params
      const { comments } = req.body
      const userId = req.user.id

      const report = await workflowService.approveReport(reportId, reportType.toUpperCase(), userId, comments)

      ResponseHelper.success(res, "Report approved successfully", report)
    } catch (error) {
      logger.error("Error approving report", error)

      if (error.message.includes("not found") || error.message.includes("not in submitted status")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to approve report")
    }
  }

  // Reject report
  async rejectReport(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.validationError(res, "Validation failed", errors.array())
      }

      const { reportId, reportType } = req.params
      const { rejectionReason } = req.body
      const userId = req.user.id

      const report = await workflowService.rejectReport(reportId, reportType.toUpperCase(), userId, rejectionReason)

      ResponseHelper.success(res, "Report rejected successfully", report)
    } catch (error) {
      logger.error("Error rejecting report", error)

      if (error.message.includes("not found") || error.message.includes("not in submitted status")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to reject report")
    }
  }

  // Return report for revision
  async returnReportForRevision(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.validationError(res, "Validation failed", errors.array())
      }

      const { reportId, reportType } = req.params
      const { revisionNotes } = req.body
      const userId = req.user.id

      const report = await workflowService.returnReportForRevision(
        reportId,
        reportType.toUpperCase(),
        userId,
        revisionNotes,
      )

      ResponseHelper.success(res, "Report returned for revision successfully", report)
    } catch (error) {
      logger.error("Error returning report for revision", error)

      if (error.message.includes("not found") || error.message.includes("not in submitted status")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to return report for revision")
    }
  }

  // Get workflow history
  async getWorkflowHistory(req, res) {
    try {
      const { reportId, reportType } = req.params

      const history = await workflowService.getWorkflowHistory(reportId, reportType.toUpperCase())

      ResponseHelper.success(res, "Workflow history retrieved successfully", history)
    } catch (error) {
      logger.error("Error fetching workflow history", error)
      ResponseHelper.serverError(res, "Failed to fetch workflow history")
    }
  }

  // Get report statistics
  async getReportStatistics(req, res) {
    try {
      const userId = req.user.id
      const { dateRange } = req.query

      const statistics = await workflowService.getReportStatistics(userId, dateRange)

      ResponseHelper.success(res, "Report statistics retrieved successfully", statistics)
    } catch (error) {
      logger.error("Error fetching report statistics", error)
      ResponseHelper.serverError(res, "Failed to fetch report statistics")
    }
  }
}

module.exports = new WorkflowController()
