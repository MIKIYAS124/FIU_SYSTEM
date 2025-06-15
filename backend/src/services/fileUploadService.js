const multer = require("multer")
const path = require("path")
const fs = require("fs").promises
const { pool } = require("../utils/database")
const { logger } = require("../utils/logger")
const { auditLog } = require("../middleware/audit")

class FileUploadService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads")
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    this.initializeUploadDir()
  }

  async initializeUploadDir() {
    try {
      await fs.access(this.uploadDir)
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true })
      logger.info("Upload directory created", { path: this.uploadDir })
    }
  }

  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const reportType = req.params.reportType || "general"
        const uploadPath = path.join(this.uploadDir, reportType)

        try {
          await fs.access(uploadPath)
        } catch {
          await fs.mkdir(uploadPath, { recursive: true })
        }

        cb(null, uploadPath)
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
      },
    })

    const fileFilter = (req, file, cb) => {
      if (this.allowedTypes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false)
      }
    }

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: 10, // Maximum 10 files per upload
      },
    })
  }

  async saveFileRecord(fileData, reportId, reportType, userId) {
    try {
      const query = `
        INSERT INTO report_attachments (
          report_id, report_type, file_name, file_path, 
          file_size, file_type, uploaded_by, uploaded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `

      const values = [
        reportId,
        reportType,
        fileData.originalname,
        fileData.path,
        fileData.size,
        fileData.mimetype,
        userId,
      ]

      const result = await pool.query(query, values)

      await auditLog(userId, "FILE_UPLOADED", "report_attachments", result.rows[0].id, {
        fileName: fileData.originalname,
        reportId,
        reportType,
      })

      logger.info("File record saved", {
        fileId: result.rows[0].id,
        fileName: fileData.originalname,
        reportId,
        userId,
      })

      return result.rows[0]
    } catch (error) {
      logger.error("Error saving file record", error)
      throw error
    }
  }

  async getFilesByReport(reportId, reportType, userId) {
    try {
      // Check if user has access to this report
      const reportService = require("./reportService")
      const hasAccess = await reportService.checkReportAccess(reportId, userId, reportType)

      if (!hasAccess) {
        throw new Error("Access denied to report files")
      }

      const query = `
        SELECT 
          ra.*,
          u.full_name as uploaded_by_name
        FROM report_attachments ra
        LEFT JOIN users u ON ra.uploaded_by = u.id
        WHERE ra.report_id = $1 AND ra.report_type = $2
        ORDER BY ra.uploaded_at DESC
      `

      const result = await pool.query(query, [reportId, reportType])
      return result.rows
    } catch (error) {
      logger.error("Error fetching files by report", error)
      throw error
    }
  }

  async deleteFile(fileId, userId) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Get file info and check access
      const fileQuery = `
        SELECT ra.*, r.created_by as report_creator
        FROM report_attachments ra
        LEFT JOIN str_reports r ON ra.report_id = r.id AND ra.report_type = 'STR'
        LEFT JOIN ctr_reports c ON ra.report_id = c.id AND ra.report_type = 'CTR'
        WHERE ra.id = $1
      `

      const fileResult = await client.query(fileQuery, [fileId])

      if (fileResult.rows.length === 0) {
        throw new Error("File not found")
      }

      const file = fileResult.rows[0]

      // Check if user can delete this file (only report creator or admin)
      const userQuery = `SELECT role FROM users WHERE id = $1`
      const userResult = await client.query(userQuery, [userId])
      const userRole = userResult.rows[0]?.role

      if (file.report_creator !== userId && !["SUPER_ADMIN", "INTERMEDIATE_ADMIN"].includes(userRole)) {
        throw new Error("Access denied to delete this file")
      }

      // Delete file record
      await client.query("DELETE FROM report_attachments WHERE id = $1", [fileId])

      // Delete physical file
      try {
        await fs.unlink(file.file_path)
      } catch (fsError) {
        logger.warn("Could not delete physical file", {
          filePath: file.file_path,
          error: fsError.message,
        })
      }

      await client.query("COMMIT")

      await auditLog(userId, "FILE_DELETED", "report_attachments", fileId, {
        fileName: file.file_name,
        reportId: file.report_id,
        reportType: file.report_type,
      })

      logger.info("File deleted", { fileId, fileName: file.file_name, userId })
      return true
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error deleting file", error)
      throw error
    } finally {
      client.release()
    }
  }

  async getFileStream(fileId, userId) {
    try {
      // Get file info and check access
      const fileQuery = `
        SELECT ra.*, r.created_by as report_creator
        FROM report_attachments ra
        LEFT JOIN str_reports r ON ra.report_id = r.id AND ra.report_type = 'STR'
        LEFT JOIN ctr_reports c ON ra.report_id = c.id AND ra.report_type = 'CTR'
        WHERE ra.id = $1
      `

      const result = await pool.query(fileQuery, [fileId])

      if (result.rows.length === 0) {
        throw new Error("File not found")
      }

      const file = result.rows[0]

      // Check access to the report
      const reportService = require("./reportService")
      const hasAccess = await reportService.checkReportAccess(file.report_id, userId, file.report_type)

      if (!hasAccess) {
        throw new Error("Access denied to this file")
      }

      // Check if file exists
      try {
        await fs.access(file.file_path)
      } catch {
        throw new Error("File not found on disk")
      }

      return {
        filePath: file.file_path,
        fileName: file.file_name,
        fileType: file.file_type,
        fileSize: file.file_size,
      }
    } catch (error) {
      logger.error("Error getting file stream", error)
      throw error
    }
  }

  async bulkUpload(files, reportId, reportType, userId) {
    const client = await pool.connect()
    const uploadedFiles = []

    try {
      await client.query("BEGIN")

      for (const file of files) {
        const fileRecord = await this.saveFileRecord(file, reportId, reportType, userId)
        uploadedFiles.push(fileRecord)
      }

      await client.query("COMMIT")

      logger.info("Bulk file upload completed", {
        count: files.length,
        reportId,
        reportType,
        userId,
      })

      return uploadedFiles
    } catch (error) {
      await client.query("ROLLBACK")

      // Clean up uploaded files on error
      for (const file of files) {
        try {
          await fs.unlink(file.path)
        } catch (cleanupError) {
          logger.warn("Could not clean up file", {
            filePath: file.path,
            error: cleanupError.message,
          })
        }
      }

      logger.error("Error in bulk file upload", error)
      throw error
    } finally {
      client.release()
    }
  }

  // Utility method to clean up old files
  async cleanupOldFiles(daysOld = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const query = `
        SELECT file_path FROM report_attachments 
        WHERE uploaded_at < $1
      `

      const result = await pool.query(query, [cutoffDate])
      let cleanedCount = 0

      for (const row of result.rows) {
        try {
          await fs.unlink(row.file_path)
          cleanedCount++
        } catch (error) {
          logger.warn("Could not delete old file", {
            filePath: row.file_path,
            error: error.message,
          })
        }
      }

      // Remove records from database
      await pool.query("DELETE FROM report_attachments WHERE uploaded_at < $1", [cutoffDate])

      logger.info("Old files cleanup completed", {
        cleanedCount,
        cutoffDate: cutoffDate.toISOString(),
      })

      return cleanedCount
    } catch (error) {
      logger.error("Error cleaning up old files", error)
      throw error
    }
  }
}

module.exports = new FileUploadService()
