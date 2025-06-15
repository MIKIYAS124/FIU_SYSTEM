const { pool } = require("../utils/database")
const { logger } = require("../utils/logger")
const notificationService = require("./notificationService")

class WorkflowService {
  // Report approval workflow
  async approveReport(reportId, reportType, approvedBy, comments = null) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const tableName = reportType === "STR" ? "str_reports" : "ctr_reports"

      // Check if report exists and is in SUBMITTED status
      const reportQuery = `
        SELECT r.*, u.full_name as creator_name, u.email as creator_email,
               re.entity_name, b.branch_name
        FROM ${tableName} r
        JOIN users u ON r.created_by = u.id
        JOIN reporting_entities re ON r.reporting_entity_id = re.id
        JOIN branches b ON r.branch_id = b.id
        WHERE r.id = $1 AND r.status = 'SUBMITTED'
      `

      const reportResult = await client.query(reportQuery, [reportId])

      if (reportResult.rows.length === 0) {
        throw new Error("Report not found or not in submitted status")
      }

      const report = reportResult.rows[0]

      // Update report status to APPROVED
      const updateQuery = `
        UPDATE ${tableName} 
        SET status = 'APPROVED', 
            approved_by = $1, 
            approved_at = NOW(), 
            approval_comments = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `

      const updatedReport = await client.query(updateQuery, [approvedBy, comments, reportId])

      // Create workflow history entry
      await this.createWorkflowHistory(client, reportId, reportType, "APPROVED", approvedBy, comments)

      // Send notification to report creator
      await notificationService.createNotification({
        userId: report.created_by,
        type: "REPORT_APPROVED",
        title: `${reportType} Report Approved`,
        message: `Your ${reportType} report ${report.report_number} has been approved.`,
        metadata: {
          reportId,
          reportType,
          reportNumber: report.report_number,
          approvedBy,
          comments,
        },
      })

      // Send notification to intermediate admin if creator is data encoder
      if (report.role === "DATA_ENCODER") {
        const intermediateAdminQuery = `
          SELECT id FROM users 
          WHERE reporting_entity_id = $1 AND role = 'INTERMEDIATE_ADMIN' AND is_active = true
        `
        const adminResult = await client.query(intermediateAdminQuery, [report.reporting_entity_id])

        for (const admin of adminResult.rows) {
          await notificationService.createNotification({
            userId: admin.id,
            type: "REPORT_APPROVED",
            title: `${reportType} Report Approved`,
            message: `${reportType} report ${report.report_number} from ${report.entity_name} - ${report.branch_name} has been approved.`,
            metadata: {
              reportId,
              reportType,
              reportNumber: report.report_number,
              entityName: report.entity_name,
              branchName: report.branch_name,
            },
          })
        }
      }

      await client.query("COMMIT")

      logger.info(`${reportType} report approved`, {
        reportId,
        reportNumber: report.report_number,
        approvedBy,
      })

      return updatedReport.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error(`Error approving ${reportType} report`, error)
      throw error
    } finally {
      client.release()
    }
  }

  async rejectReport(reportId, reportType, rejectedBy, rejectionReason) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const tableName = reportType === "STR" ? "str_reports" : "ctr_reports"

      // Check if report exists and is in SUBMITTED status
      const reportQuery = `
        SELECT r.*, u.full_name as creator_name, u.email as creator_email,
               re.entity_name, b.branch_name
        FROM ${tableName} r
        JOIN users u ON r.created_by = u.id
        JOIN reporting_entities re ON r.reporting_entity_id = re.id
        JOIN branches b ON r.branch_id = b.id
        WHERE r.id = $1 AND r.status = 'SUBMITTED'
      `

      const reportResult = await client.query(reportQuery, [reportId])

      if (reportResult.rows.length === 0) {
        throw new Error("Report not found or not in submitted status")
      }

      const report = reportResult.rows[0]

      // Update report status to REJECTED
      const updateQuery = `
        UPDATE ${tableName} 
        SET status = 'REJECTED', 
            rejected_by = $1, 
            rejected_at = NOW(), 
            rejection_reason = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `

      const updatedReport = await client.query(updateQuery, [rejectedBy, rejectionReason, reportId])

      // Create workflow history entry
      await this.createWorkflowHistory(client, reportId, reportType, "REJECTED", rejectedBy, rejectionReason)

      // Send notification to report creator
      await notificationService.createNotification({
        userId: report.created_by,
        type: "REPORT_REJECTED",
        title: `${reportType} Report Rejected`,
        message: `Your ${reportType} report ${report.report_number} has been rejected. Reason: ${rejectionReason}`,
        metadata: {
          reportId,
          reportType,
          reportNumber: report.report_number,
          rejectedBy,
          rejectionReason,
        },
      })

      await client.query("COMMIT")

      logger.info(`${reportType} report rejected`, {
        reportId,
        reportNumber: report.report_number,
        rejectedBy,
        rejectionReason,
      })

      return updatedReport.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error(`Error rejecting ${reportType} report`, error)
      throw error
    } finally {
      client.release()
    }
  }

  async returnReportForRevision(reportId, reportType, returnedBy, revisionNotes) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const tableName = reportType === "STR" ? "str_reports" : "ctr_reports"

      // Check if report exists and is in SUBMITTED status
      const reportQuery = `
        SELECT r.*, u.full_name as creator_name, u.email as creator_email,
               re.entity_name, b.branch_name
        FROM ${tableName} r
        JOIN users u ON r.created_by = u.id
        JOIN reporting_entities re ON r.reporting_entity_id = re.id
        JOIN branches b ON r.branch_id = b.id
        WHERE r.id = $1 AND r.status = 'SUBMITTED'
      `

      const reportResult = await client.query(reportQuery, [reportId])

      if (reportResult.rows.length === 0) {
        throw new Error("Report not found or not in submitted status")
      }

      const report = reportResult.rows[0]

      // Update report status to RETURNED
      const updateQuery = `
        UPDATE ${tableName} 
        SET status = 'RETURNED', 
            returned_by = $1, 
            returned_at = NOW(), 
            revision_notes = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `

      const updatedReport = await client.query(updateQuery, [returnedBy, revisionNotes, reportId])

      // Create workflow history entry
      await this.createWorkflowHistory(client, reportId, reportType, "RETURNED", returnedBy, revisionNotes)

      // Send notification to report creator
      await notificationService.createNotification({
        userId: report.created_by,
        type: "REPORT_RETURNED",
        title: `${reportType} Report Returned for Revision`,
        message: `Your ${reportType} report ${report.report_number} has been returned for revision. Notes: ${revisionNotes}`,
        metadata: {
          reportId,
          reportType,
          reportNumber: report.report_number,
          returnedBy,
          revisionNotes,
        },
      })

      await client.query("COMMIT")

      logger.info(`${reportType} report returned for revision`, {
        reportId,
        reportNumber: report.report_number,
        returnedBy,
        revisionNotes,
      })

      return updatedReport.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error(`Error returning ${reportType} report for revision`, error)
      throw error
    } finally {
      client.release()
    }
  }

  async getReportsForReview(userId, filters = {}) {
    try {
      const { page = 1, limit = 10, status = "SUBMITTED", reportType, dateFrom, dateTo, search } = filters

      // Get user info to determine access level
      const userQuery = `
        SELECT role, reporting_entity_id 
        FROM users WHERE id = $1
      `
      const userResult = await pool.query(userQuery, [userId])
      const user = userResult.rows[0]

      if (!user || !["SUPER_ADMIN", "INTERMEDIATE_ADMIN"].includes(user.role)) {
        throw new Error("Access denied - insufficient permissions")
      }

      let baseQuery = ""
      let countQuery = ""
      const whereConditions = [`r.status = '${status}'`]
      const queryParams = []
      let paramIndex = 1

      // Build base query for both STR and CTR reports
      if (reportType === "STR" || !reportType) {
        baseQuery = `
          SELECT 
            r.id, r.report_number, r.transaction_date, r.transaction_amount,
            r.transaction_currency, r.status, r.created_at, r.submitted_at,
            'STR' as report_type,
            re.entity_name, b.branch_name,
            u.full_name as creator_name,
            tm.manner_name as transaction_manner,
            ct.crime_name as crime_type
          FROM str_reports r
          JOIN users u ON r.created_by = u.id
          JOIN reporting_entities re ON r.reporting_entity_id = re.id
          JOIN branches b ON r.branch_id = b.id
          LEFT JOIN transaction_manner tm ON r.transaction_manner_id = tm.id
          LEFT JOIN crime_types ct ON r.crime_type_id = ct.id
        `
        countQuery = "SELECT COUNT(*) FROM str_reports r"
      } else if (reportType === "CTR") {
        baseQuery = `
          SELECT 
            r.id, r.report_number, r.transaction_date, r.transaction_amount,
            r.transaction_currency, r.status, r.created_at, r.submitted_at,
            'CTR' as report_type,
            re.entity_name, b.branch_name,
            u.full_name as creator_name,
            r.transaction_type
          FROM ctr_reports r
          JOIN users u ON r.created_by = u.id
          JOIN reporting_entities re ON r.reporting_entity_id = re.id
          JOIN branches b ON r.branch_id = b.id
        `
        countQuery = "SELECT COUNT(*) FROM ctr_reports r"
      }

      // Add access control based on user role
      if (user.role === "INTERMEDIATE_ADMIN") {
        whereConditions.push(`r.reporting_entity_id = $${paramIndex}`)
        queryParams.push(user.reporting_entity_id)
        paramIndex++
      }

      // Add filters
      if (dateFrom) {
        whereConditions.push(`r.submitted_at >= $${paramIndex}`)
        queryParams.push(dateFrom)
        paramIndex++
      }

      if (dateTo) {
        whereConditions.push(`r.submitted_at <= $${paramIndex}`)
        queryParams.push(dateTo)
        paramIndex++
      }

      if (search) {
        whereConditions.push(`(
          r.report_number ILIKE $${paramIndex} OR 
          r.account_holder_name ILIKE $${paramIndex} OR
          re.entity_name ILIKE $${paramIndex} OR
          b.branch_name ILIKE $${paramIndex}
        )`)
        queryParams.push(`%${search}%`)
        paramIndex++
      }

      // Build WHERE clause
      const whereClause = `WHERE ${whereConditions.join(" AND ")}`

      // Get total count
      const totalResult = await pool.query(`${countQuery} ${whereClause}`, queryParams)
      const total = Number.parseInt(totalResult.rows[0].count)

      // Get paginated results
      const offset = (page - 1) * limit
      const finalQuery = `
        ${baseQuery} 
        ${whereClause}
        ORDER BY r.submitted_at DESC
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
      logger.error("Error fetching reports for review", error)
      throw error
    }
  }

  async getWorkflowHistory(reportId, reportType) {
    try {
      const query = `
        SELECT 
          wh.*,
          u.full_name as action_by_name
        FROM workflow_history wh
        JOIN users u ON wh.action_by = u.id
        WHERE wh.report_id = $1 AND wh.report_type = $2
        ORDER BY wh.created_at DESC
      `

      const result = await pool.query(query, [reportId, reportType])
      return result.rows
    } catch (error) {
      logger.error("Error fetching workflow history", error)
      throw error
    }
  }

  async createWorkflowHistory(client, reportId, reportType, action, actionBy, comments = null) {
    try {
      const query = `
        INSERT INTO workflow_history (
          report_id, report_type, action, action_by, comments, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `

      await client.query(query, [reportId, reportType, action, actionBy, comments])
    } catch (error) {
      logger.error("Error creating workflow history", error)
      throw error
    }
  }

  async getReportStatistics(userId, dateRange = "30") {
    try {
      const userQuery = `
        SELECT role, reporting_entity_id 
        FROM users WHERE id = $1
      `
      const userResult = await pool.query(userQuery, [userId])
      const user = userResult.rows[0]

      let whereClause = ""
      let queryParams = []

      if (user.role === "INTERMEDIATE_ADMIN") {
        whereClause = "WHERE r.reporting_entity_id = $1"
        queryParams = [user.reporting_entity_id]
      }

      const dateFilter = `AND r.created_at >= CURRENT_DATE - INTERVAL '${dateRange} days'`

      // Get comprehensive statistics
      const statsQuery = `
        SELECT 
          -- STR Statistics
          (SELECT COUNT(*) FROM str_reports r ${whereClause} ${dateFilter}) as str_total,
          (SELECT COUNT(*) FROM str_reports r ${whereClause} AND r.status = 'SUBMITTED' ${dateFilter}) as str_pending,
          (SELECT COUNT(*) FROM str_reports r ${whereClause} AND r.status = 'APPROVED' ${dateFilter}) as str_approved,
          (SELECT COUNT(*) FROM str_reports r ${whereClause} AND r.status = 'REJECTED' ${dateFilter}) as str_rejected,
          (SELECT COUNT(*) FROM str_reports r ${whereClause} AND r.status = 'RETURNED' ${dateFilter}) as str_returned,
          
          -- CTR Statistics
          (SELECT COUNT(*) FROM ctr_reports r ${whereClause} ${dateFilter}) as ctr_total,
          (SELECT COUNT(*) FROM ctr_reports r ${whereClause} AND r.status = 'SUBMITTED' ${dateFilter}) as ctr_pending,
          (SELECT COUNT(*) FROM ctr_reports r ${whereClause} AND r.status = 'APPROVED' ${dateFilter}) as ctr_approved,
          (SELECT COUNT(*) FROM ctr_reports r ${whereClause} AND r.status = 'REJECTED' ${dateFilter}) as ctr_rejected,
          (SELECT COUNT(*) FROM ctr_reports r ${whereClause} AND r.status = 'RETURNED' ${dateFilter}) as ctr_returned,
          
          -- Processing Times (average days from submission to approval/rejection)
          (SELECT AVG(EXTRACT(EPOCH FROM (approved_at - submitted_at))/86400) 
           FROM str_reports r ${whereClause} AND r.status = 'APPROVED' ${dateFilter}) as str_avg_processing_days,
          (SELECT AVG(EXTRACT(EPOCH FROM (approved_at - submitted_at))/86400) 
           FROM ctr_reports r ${whereClause} AND r.status = 'APPROVED' ${dateFilter}) as ctr_avg_processing_days
      `

      const result = await pool.query(statsQuery, queryParams)

      // Get daily trends for the last 30 days
      const trendsQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE report_type = 'STR') as str_count,
          COUNT(*) FILTER (WHERE report_type = 'CTR') as ctr_count
        FROM (
          SELECT created_at, 'STR' as report_type FROM str_reports r ${whereClause} ${dateFilter}
          UNION ALL
          SELECT created_at, 'CTR' as report_type FROM ctr_reports r ${whereClause} ${dateFilter}
        ) combined_reports
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `

      const trendsResult = await pool.query(trendsQuery, queryParams)

      return {
        statistics: result.rows[0],
        dailyTrends: trendsResult.rows,
      }
    } catch (error) {
      logger.error("Error fetching report statistics", error)
      throw error
    }
  }
}

module.exports = new WorkflowService()
