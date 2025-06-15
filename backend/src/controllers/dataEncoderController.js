const reportService = require("../services/reportService")
const fileUploadService = require("../services/fileUploadService")
const { ResponseHelper } = require("../utils/response")
const { logger } = require("../utils/logger")
const { validationResult } = require("express-validator")

class DataEncoderController {
  // Dashboard
  async getDashboard(req, res) {
    try {
      const userId = req.user.id
      const stats = await reportService.getDashboardStats(userId)

      ResponseHelper.success(res, "Dashboard data retrieved successfully", stats)
    } catch (error) {
      logger.error("Error fetching data encoder dashboard", error)
      ResponseHelper.serverError(res, "Failed to fetch dashboard data")
    }
  }

  // STR Report Management
  async createSTRReport(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.validationError(res, "Validation failed", errors.array())
      }

      const userId = req.user.id
      const reportData = {
        ...req.body,
        reportingEntityId: req.user.reporting_entity_id,
        branchId: req.user.branch_id,
      }

      const report = await reportService.createSTRReport(reportData, userId)

      ResponseHelper.created(res, "STR report created successfully", report)
    } catch (error) {
      logger.error("Error creating STR report", error)
      ResponseHelper.serverError(res, "Failed to create STR report")
    }
  }

  async updateSTRReport(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.validationError(res, "Validation failed", errors.array())
      }

      const { id } = req.params
      const userId = req.user.id
      const reportData = req.body

      const report = await reportService.updateSTRReport(id, reportData, userId)

      ResponseHelper.success(res, "STR report updated successfully", report)
    } catch (error) {
      logger.error("Error updating STR report", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to update STR report")
    }
  }

  async getSTRReports(req, res) {
    try {
      const userId = req.user.id
      const filters = {
        ...req.query,
        reportType: "STR",
      }

      const result = await reportService.getReports(userId, filters)

      ResponseHelper.success(res, "STR reports retrieved successfully", result)
    } catch (error) {
      logger.error("Error fetching STR reports", error)
      ResponseHelper.serverError(res, "Failed to fetch STR reports")
    }
  }

  async getSTRReportById(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const report = await reportService.getReportById(id, userId, "STR")

      ResponseHelper.success(res, "STR report retrieved successfully", report)
    } catch (error) {
      logger.error("Error fetching STR report", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to fetch STR report")
    }
  }

  async submitSTRReport(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const report = await reportService.submitReport(id, userId, "STR")

      ResponseHelper.success(res, "STR report submitted successfully", report)
    } catch (error) {
      logger.error("Error submitting STR report", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to submit STR report")
    }
  }

  async deleteSTRReport(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      await reportService.deleteReport(id, userId, "STR")

      ResponseHelper.success(res, "STR report deleted successfully")
    } catch (error) {
      logger.error("Error deleting STR report", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to delete STR report")
    }
  }

  // CTR Report Management
  async createCTRReport(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.validationError(res, "Validation failed", errors.array())
      }

      const userId = req.user.id
      const reportData = {
        ...req.body,
        reportingEntityId: req.user.reporting_entity_id,
        branchId: req.user.branch_id,
      }

      const report = await reportService.createCTRReport(reportData, userId)

      ResponseHelper.created(res, "CTR report created successfully", report)
    } catch (error) {
      logger.error("Error creating CTR report", error)
      ResponseHelper.serverError(res, "Failed to create CTR report")
    }
  }

  async getCTRReports(req, res) {
    try {
      const userId = req.user.id
      const filters = {
        ...req.query,
        reportType: "CTR",
      }

      const result = await reportService.getReports(userId, filters)

      ResponseHelper.success(res, "CTR reports retrieved successfully", result)
    } catch (error) {
      logger.error("Error fetching CTR reports", error)
      ResponseHelper.serverError(res, "Failed to fetch CTR reports")
    }
  }

  async getCTRReportById(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const report = await reportService.getReportById(id, userId, "CTR")

      ResponseHelper.success(res, "CTR report retrieved successfully", report)
    } catch (error) {
      logger.error("Error fetching CTR report", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to fetch CTR report")
    }
  }

  async submitCTRReport(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const report = await reportService.submitReport(id, userId, "CTR")

      ResponseHelper.success(res, "CTR report submitted successfully", report)
    } catch (error) {
      logger.error("Error submitting CTR report", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to submit CTR report")
    }
  }

  async deleteCTRReport(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      await reportService.deleteReport(id, userId, "CTR")

      ResponseHelper.success(res, "CTR report deleted successfully")
    } catch (error) {
      logger.error("Error deleting CTR report", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to delete CTR report")
    }
  }

  // File Upload Management
  async uploadFiles(req, res) {
    try {
      const { reportId, reportType } = req.params
      const userId = req.user.id
      const files = req.files

      if (!files || files.length === 0) {
        return ResponseHelper.badRequest(res, "No files uploaded")
      }

      const uploadedFiles = await fileUploadService.bulkUpload(files, reportId, reportType.toUpperCase(), userId)

      ResponseHelper.success(res, "Files uploaded successfully", uploadedFiles)
    } catch (error) {
      logger.error("Error uploading files", error)

      if (error.message.includes("File type")) {
        return ResponseHelper.badRequest(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to upload files")
    }
  }

  async getReportFiles(req, res) {
    try {
      const { reportId, reportType } = req.params
      const userId = req.user.id

      const files = await fileUploadService.getFilesByReport(reportId, reportType.toUpperCase(), userId)

      ResponseHelper.success(res, "Files retrieved successfully", files)
    } catch (error) {
      logger.error("Error fetching report files", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to fetch files")
    }
  }

  async downloadFile(req, res) {
    try {
      const { fileId } = req.params
      const userId = req.user.id

      const fileInfo = await fileUploadService.getFileStream(fileId, userId)

      res.setHeader("Content-Disposition", `attachment; filename="${fileInfo.fileName}"`)
      res.setHeader("Content-Type", fileInfo.fileType)
      res.setHeader("Content-Length", fileInfo.fileSize)

      res.sendFile(fileInfo.filePath)
    } catch (error) {
      logger.error("Error downloading file", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to download file")
    }
  }

  async deleteFile(req, res) {
    try {
      const { fileId } = req.params
      const userId = req.user.id

      await fileUploadService.deleteFile(fileId, userId)

      ResponseHelper.success(res, "File deleted successfully")
    } catch (error) {
      logger.error("Error deleting file", error)

      if (error.message.includes("Access denied")) {
        return ResponseHelper.forbidden(res, error.message)
      }

      if (error.message.includes("not found")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to delete file")
    }
  }

  // Bulk operations
  async bulkSubmitReports(req, res) {
    try {
      const { reportIds, reportType } = req.body
      const userId = req.user.id

      if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
        return ResponseHelper.badRequest(res, "Report IDs are required")
      }

      const results = []
      const errors = []

      for (const reportId of reportIds) {
        try {
          const report = await reportService.submitReport(reportId, userId, reportType)
          results.push(report)
        } catch (error) {
          errors.push({ reportId, error: error.message })
        }
      }

      ResponseHelper.success(res, "Bulk submit completed", {
        successful: results,
        failed: errors,
        summary: {
          total: reportIds.length,
          successful: results.length,
          failed: errors.length,
        },
      })
    } catch (error) {
      logger.error("Error in bulk submit", error)
      ResponseHelper.serverError(res, "Failed to bulk submit reports")
    }
  }
}

module.exports = new DataEncoderController()
