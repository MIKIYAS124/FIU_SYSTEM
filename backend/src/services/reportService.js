const { pool } = require("../utils/database")
const { logger } = require("../utils/logger")
const { auditLog } = require("../middleware/audit")

class ReportService {
  // STR Report Management
  async createSTRReport(reportData, userId) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Generate report number
      const reportNumber = await this.generateReportNumber("STR")

      const query = `
        INSERT INTO str_reports (
          report_number, reporting_entity_id, branch_id, created_by,
          transaction_date, transaction_amount, transaction_currency,
          transaction_manner_id, crime_type_id, account_number,
          account_holder_name, account_holder_id_type, account_holder_id_number,
          beneficiary_name, beneficiary_account, beneficiary_bank,
          person_reported_name, person_reported_id_type, person_reported_id_number,
          person_reported_address, person_reported_phone, person_reported_email,
          suspicious_activity_description, additional_information,
          status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, NOW(), NOW()
        ) RETURNING *
      `

      const values = [
        reportNumber,
        reportData.reportingEntityId,
        reportData.branchId,
        userId,
        reportData.transactionDate,
        reportData.transactionAmount,
        reportData.transactionCurrency,
        reportData.transactionMannerId,
        reportData.crimeTypeId,
        reportData.accountNumber,
        reportData.accountHolderName,
        reportData.accountHolderIdType,
        reportData.accountHolderIdNumber,
        reportData.beneficiaryName,
        reportData.beneficiaryAccount,
        reportData.beneficiaryBank,
        reportData.personReportedName,
        reportData.personReportedIdType,
        reportData.personReportedIdNumber,
        reportData.personReportedAddress,
        reportData.personReportedPhone,
        reportData.personReportedEmail,
        reportData.suspiciousActivityDescription,
        reportData.additionalInformation,
        reportData.status || "DRAFT",
      ]

      const result = await client.query(query, values)
      await client.query("COMMIT")

      await auditLog(userId, "STR_REPORT_CREATED", "str_reports", result.rows[0].id, {
        reportNumber: reportNumber,
        status: reportData.status || "DRAFT",
      })

      logger.info("STR report created", { reportId: result.rows[0].id, userId })
      return result.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error creating STR report", error)
      throw error
    } finally {
      client.release()
    }
  }

  async updateSTRReport(reportId, reportData, userId) {
    const client = await pool.connect()
    try {
      // Check if user can access this report
      const accessCheck = await this.checkReportAccess(reportId, userId, "STR")
      if (!accessCheck) {
        throw new Error("Access denied to this report")
      }

      const query = `
        UPDATE str_reports SET
          transaction_date = $1, transaction_amount = $2, transaction_currency = $3,
          transaction_manner_id = $4, crime_type_id = $5, account_number = $6,
          account_holder_name = $7, account_holder_id_type = $8, account_holder_id_number = $9,
          beneficiary_name = $10, beneficiary_account = $11, beneficiary_bank = $12,
          person_reported_name = $13, person_reported_id_type = $14, person_reported_id_number = $15,
          person_reported_address = $16, person_reported_phone = $17, person_reported_email = $18,
          suspicious_activity_description = $19, additional_information = $20,
          status = $21, updated_at = NOW(), updated_by = $22
        WHERE id = $23 AND status IN ('DRAFT', 'RETURNED')
        RETURNING *
      `

      const values = [
        reportData.transactionDate,
        reportData.transactionAmount,
        reportData.transactionCurrency,
        reportData.transactionMannerId,
        reportData.crimeTypeId,
        reportData.accountNumber,
        reportData.accountHolderName,
        reportData.accountHolderIdType,
        reportData.accountHolderIdNumber,
        reportData.beneficiaryName,
        reportData.beneficiaryAccount,
        reportData.beneficiaryBank,
        reportData.personReportedName,
        reportData.personReportedIdType,
        reportData.personReportedIdNumber,
        reportData.personReportedAddress,
        reportData.personReportedPhone,
        reportData.personReportedEmail,
        reportData.suspiciousActivityDescription,
        reportData.additionalInformation,
        reportData.status,
        userId,
        reportId,
      ]

      const result = await client.query(query, values)

      if (result.rows.length === 0) {
        throw new Error("Report not found or cannot be updated")
      }

      await auditLog(userId, "STR_REPORT_UPDATED", "str_reports", reportId, {
        status: reportData.status,
      })

      logger.info("STR report updated", { reportId, userId })
      return result.rows[0]
    } catch (error) {
      logger.error("Error updating STR report", error)
      throw error
    } finally {
      client.release()
    }
  }

  async createCTRReport(reportData, userId) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const reportNumber = await this.generateReportNumber("CTR")

      const query = `
        INSERT INTO ctr_reports (
          report_number, reporting_entity_id, branch_id, created_by,
          transaction_date, transaction_amount, transaction_currency,
          transaction_type, account_number, account_holder_name,
          account_holder_id_type, account_holder_id_number,
          beneficiary_name, beneficiary_account, beneficiary_bank,
          transaction_description, additional_information,
          status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
        ) RETURNING *
      `

      const values = [
        reportNumber,
        reportData.reportingEntityId,
        reportData.branchId,
        userId,
        reportData.transactionDate,
        reportData.transactionAmount,
        reportData.transactionCurrency,
        reportData.transactionType,
        reportData.accountNumber,
        reportData.accountHolderName,
        reportData.accountHolderIdType,
        reportData.accountHolderIdNumber,
        reportData.beneficiaryName,
        reportData.beneficiaryAccount,
        reportData.beneficiaryBank,
        reportData.transactionDescription,
        reportData.additionalInformation,
        reportData.status || "DRAFT",
      ]

      const result = await client.query(query, values)
      await client.query("COMMIT")

      await auditLog(userId, "CTR_REPORT_CREATED", "ctr_reports", result.rows[0].id, {
        reportNumber: reportNumber,
        status: reportData.status || "DRAFT",
      })

      logger.info("CTR report created", { reportId: result.rows[0].id, userId })
      return result.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error creating CTR report", error)
      throw error
    } finally {
      client.release()
    }
  }

  async getReports(userId, filters = {}) {
    try {
      const { page = 1, limit = 10, status, reportType, dateFrom, dateTo, search } = filters

      // Get user info to determine access level
      const userQuery = `
        SELECT role, reporting_entity_id, branch_id 
        FROM users WHERE id = $1
      `
      const userResult = await pool.query(userQuery, [userId])
      const user = userResult.rows[0]

      let baseQuery = ""
      let countQuery = ""
      const whereConditions = []
      const queryParams = []
      let paramIndex = 1

      if (reportType === "STR" || !reportType) {
        baseQuery = `
          SELECT 
            s.id, s.report_number, s.transaction_date, s.transaction_amount,
            s.transaction_currency, s.status, s.created_at, s.updated_at,
            'STR' as report_type,
            re.entity_name as reporting_entity_name,
            b.branch_name,
            tm.manner_name as transaction_manner,
            ct.crime_name as crime_type,
            u.full_name as created_by_name
          FROM str_reports s
          LEFT JOIN reporting_entities re ON s.reporting_entity_id = re.id
          LEFT JOIN branches b ON s.branch_id = b.id
          LEFT JOIN transaction_manner tm ON s.transaction_manner_id = tm.id
          LEFT JOIN crime_types ct ON s.crime_type_id = ct.id
          LEFT JOIN users u ON s.created_by = u.id
        `
        countQuery = "SELECT COUNT(*) FROM str_reports s"
      }

      // Add access control based on user role
      if (user.role === "DATA_ENCODER") {
        whereConditions.push(`s.created_by = $${paramIndex}`)
        queryParams.push(userId)
        paramIndex++
      } else if (user.role === "INTERMEDIATE_ADMIN") {
        whereConditions.push(`s.reporting_entity_id = $${paramIndex}`)
        queryParams.push(user.reporting_entity_id)
        paramIndex++
      }

      // Add filters
      if (status) {
        whereConditions.push(`s.status = $${paramIndex}`)
        queryParams.push(status)
        paramIndex++
      }

      if (dateFrom) {
        whereConditions.push(`s.transaction_date >= $${paramIndex}`)
        queryParams.push(dateFrom)
        paramIndex++
      }

      if (dateTo) {
        whereConditions.push(`s.transaction_date <= $${paramIndex}`)
        queryParams.push(dateTo)
        paramIndex++
      }

      if (search) {
        whereConditions.push(`(
          s.report_number ILIKE $${paramIndex} OR 
          s.account_holder_name ILIKE $${paramIndex} OR
          s.person_reported_name ILIKE $${paramIndex}
        )`)
        queryParams.push(`%${search}%`)
        paramIndex++
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

      // Get total count
      const totalResult = await pool.query(`${countQuery} ${whereClause}`, queryParams)
      const total = Number.parseInt(totalResult.rows[0].count)

      // Get paginated results
      const offset = (page - 1) * limit
      const finalQuery = `
        ${baseQuery} 
        ${whereClause}
        ORDER BY s.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `

      queryParams.push(limit, offset)
      const result = await pool.query(finalQuery, queryParams)

      return {
        reports: result.rows,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error("Error fetching reports", error)
      throw error
    }
  }

  async getReportById(reportId, userId, reportType = "STR") {
    try {
      // Check access
      const accessCheck = await this.checkReportAccess(reportId, userId, reportType)
      if (!accessCheck) {
        throw new Error("Access denied to this report")
      }

      let query = ""
      if (reportType === "STR") {
        query = `
          SELECT 
            s.*,
            re.entity_name as reporting_entity_name,
            b.branch_name,
            tm.manner_name as transaction_manner,
            ct.crime_name as crime_type,
            u.full_name as created_by_name
          FROM str_reports s
          LEFT JOIN reporting_entities re ON s.reporting_entity_id = re.id
          LEFT JOIN branches b ON s.branch_id = b.id
          LEFT JOIN transaction_manner tm ON s.transaction_manner_id = tm.id
          LEFT JOIN crime_types ct ON s.crime_type_id = ct.id
          LEFT JOIN users u ON s.created_by = u.id
          WHERE s.id = $1
        `
      } else {
        query = `
          SELECT 
            c.*,
            re.entity_name as reporting_entity_name,
            b.branch_name,
            u.full_name as created_by_name
          FROM ctr_reports c
          LEFT JOIN reporting_entities re ON c.reporting_entity_id = re.id
          LEFT JOIN branches b ON c.branch_id = b.id
          LEFT JOIN users u ON c.created_by = u.id
          WHERE c.id = $1
        `
      }

      const result = await pool.query(query, [reportId])

      if (result.rows.length === 0) {
        throw new Error("Report not found")
      }

      // Get attachments
      const attachmentsQuery = `
        SELECT id, file_name, file_path, file_size, file_type, uploaded_at
        FROM report_attachments 
        WHERE report_id = $1 AND report_type = $2
        ORDER BY uploaded_at DESC
      `
      const attachments = await pool.query(attachmentsQuery, [reportId, reportType])

      return {
        ...result.rows[0],
        attachments: attachments.rows,
      }
    } catch (error) {
      logger.error("Error fetching report by ID", error)
      throw error
    }
  }

  async submitReport(reportId, userId, reportType = "STR") {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Check access and current status
      const accessCheck = await this.checkReportAccess(reportId, userId, reportType)
      if (!accessCheck) {
        throw new Error("Access denied to this report")
      }

      const tableName = reportType === "STR" ? "str_reports" : "ctr_reports"

      // Update status to SUBMITTED
      const updateQuery = `
        UPDATE ${tableName} 
        SET status = 'SUBMITTED', submitted_at = NOW(), updated_at = NOW(), updated_by = $1
        WHERE id = $2 AND status = 'DRAFT'
        RETURNING *
      `

      const result = await client.query(updateQuery, [userId, reportId])

      if (result.rows.length === 0) {
        throw new Error("Report not found or cannot be submitted")
      }

      await client.query("COMMIT")

      await auditLog(userId, `${reportType}_REPORT_SUBMITTED`, tableName, reportId, {
        reportNumber: result.rows[0].report_number,
      })

      logger.info(`${reportType} report submitted`, { reportId, userId })
      return result.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error(`Error submitting ${reportType} report`, error)
      throw error
    } finally {
      client.release()
    }
  }

  async deleteReport(reportId, userId, reportType = "STR") {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Check access
      const accessCheck = await this.checkReportAccess(reportId, userId, reportType)
      if (!accessCheck) {
        throw new Error("Access denied to this report")
      }

      const tableName = reportType === "STR" ? "str_reports" : "ctr_reports"

      // Can only delete DRAFT reports
      const deleteQuery = `
        DELETE FROM ${tableName} 
        WHERE id = $1 AND status = 'DRAFT' AND created_by = $2
        RETURNING report_number
      `

      const result = await client.query(deleteQuery, [reportId, userId])

      if (result.rows.length === 0) {
        throw new Error("Report not found or cannot be deleted")
      }

      // Delete associated attachments
      await client.query("DELETE FROM report_attachments WHERE report_id = $1 AND report_type = $2", [
        reportId,
        reportType,
      ])

      await client.query("COMMIT")

      await auditLog(userId, `${reportType}_REPORT_DELETED`, tableName, reportId, {
        reportNumber: result.rows[0].report_number,
      })

      logger.info(`${reportType} report deleted`, { reportId, userId })
      return true
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error(`Error deleting ${reportType} report`, error)
      throw error
    } finally {
      client.release()
    }
  }

  // Helper methods
  async generateReportNumber(type) {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, "0")

    const countQuery = `
      SELECT COUNT(*) as count 
      FROM ${type === "STR" ? "str_reports" : "ctr_reports"}
      WHERE EXTRACT(YEAR FROM created_at) = $1 
      AND EXTRACT(MONTH FROM created_at) = $2
    `

    const result = await pool.query(countQuery, [year, new Date().getMonth() + 1])
    const sequence = String(Number.parseInt(result.rows[0].count) + 1).padStart(4, "0")

    return `${type}-${year}${month}-${sequence}`
  }

  async checkReportAccess(reportId, userId, reportType = "STR") {
    try {
      const userQuery = `
        SELECT role, reporting_entity_id, branch_id 
        FROM users WHERE id = $1
      `
      const userResult = await pool.query(userQuery, [userId])
      const user = userResult.rows[0]

      if (!user) return false

      const tableName = reportType === "STR" ? "str_reports" : "ctr_reports"

      let accessQuery = ""
      const queryParams = [reportId]

      if (user.role === "SUPER_ADMIN") {
        // Super admin can access all reports
        accessQuery = `SELECT id FROM ${tableName} WHERE id = $1`
      } else if (user.role === "INTERMEDIATE_ADMIN") {
        // Intermediate admin can access reports from their entity
        accessQuery = `
          SELECT id FROM ${tableName} 
          WHERE id = $1 AND reporting_entity_id = $2
        `
        queryParams.push(user.reporting_entity_id)
      } else if (user.role === "DATA_ENCODER") {
        // Data encoder can only access their own reports
        accessQuery = `
          SELECT id FROM ${tableName} 
          WHERE id = $1 AND created_by = $2
        `
        queryParams.push(userId)
      } else {
        return false
      }

      const result = await pool.query(accessQuery, queryParams)
      return result.rows.length > 0
    } catch (error) {
      logger.error("Error checking report access", error)
      return false
    }
  }

  async getDashboardStats(userId) {
    try {
      const userQuery = `
        SELECT role, reporting_entity_id, branch_id 
        FROM users WHERE id = $1
      `
      const userResult = await pool.query(userQuery, [userId])
      const user = userResult.rows[0]

      let whereClause = ""
      let queryParams = []

      if (user.role === "DATA_ENCODER") {
        whereClause = "WHERE created_by = $1"
        queryParams = [userId]
      } else if (user.role === "INTERMEDIATE_ADMIN") {
        whereClause = "WHERE reporting_entity_id = $1"
        queryParams = [user.reporting_entity_id]
      }

      // Get STR stats
      const strStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
          COUNT(*) FILTER (WHERE status = 'SUBMITTED') as submitted,
          COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
          COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
          COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today
        FROM str_reports ${whereClause}
      `

      // Get CTR stats
      const ctrStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
          COUNT(*) FILTER (WHERE status = 'SUBMITTED') as submitted,
          COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
          COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
          COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today
        FROM ctr_reports ${whereClause}
      `

      const [strStats, ctrStats] = await Promise.all([
        pool.query(strStatsQuery, queryParams),
        pool.query(ctrStatsQuery, queryParams),
      ])

      // Get recent activity
      const recentActivityQuery = `
        (SELECT 
          'STR' as type, report_number, status, created_at, updated_at
         FROM str_reports ${whereClause}
         ORDER BY updated_at DESC LIMIT 5)
        UNION ALL
        (SELECT 
          'CTR' as type, report_number, status, created_at, updated_at
         FROM ctr_reports ${whereClause}
         ORDER BY updated_at DESC LIMIT 5)
        ORDER BY updated_at DESC LIMIT 10
      `

      const recentActivity = await pool.query(recentActivityQuery, queryParams)

      return {
        str: strStats.rows[0],
        ctr: ctrStats.rows[0],
        recentActivity: recentActivity.rows,
      }
    } catch (error) {
      logger.error("Error fetching dashboard stats", error)
      throw error
    }
  }
}

module.exports = new ReportService()
