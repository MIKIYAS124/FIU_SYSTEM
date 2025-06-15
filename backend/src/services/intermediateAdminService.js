const { pool } = require("../utils/database")
const { logger } = require("../utils/logger")
const bcrypt = require("bcrypt")
const { generateRandomPassword } = require("../utils/auth")

class IntermediateAdminService {
  // Get dashboard statistics for intermediate admin
  async getDashboardStats(userId) {
    try {
      // Get user's reporting entity and branches
      const userInfo = await pool.query(
        `SELECT u.reporting_entity_id, re.entity_name
         FROM users u
         LEFT JOIN reporting_entities re ON u.reporting_entity_id = re.id
         WHERE u.id = $1`,
        [userId],
      )

      if (userInfo.rows.length === 0) {
        throw new Error("User not found")
      }

      const reportingEntityId = userInfo.rows[0].reporting_entity_id
      const entityName = userInfo.rows[0].entity_name

      const stats = await pool.query(
        `SELECT 
          -- Branch statistics
          (SELECT COUNT(*) FROM branches WHERE reporting_entity_id = $1 AND is_active = true) as total_branches,
          
          -- User statistics
          (SELECT COUNT(*) FROM users WHERE reporting_entity_id = $1 AND role = 'DATA_ENCODER' AND is_active = true) as active_data_encoders,
          (SELECT COUNT(*) FROM users WHERE reporting_entity_id = $1 AND role = 'DATA_ENCODER') as total_data_encoders,
          
          -- Report statistics
          (SELECT COUNT(*) FROM str_reports sr 
           JOIN branches b ON sr.branch_id = b.id 
           WHERE b.reporting_entity_id = $1) as total_str_reports,
          (SELECT COUNT(*) FROM ctr_reports cr 
           JOIN branches b ON cr.branch_id = b.id 
           WHERE b.reporting_entity_id = $1) as total_ctr_reports,
          
          -- Recent reports (last 30 days)
          (SELECT COUNT(*) FROM str_reports sr 
           JOIN branches b ON sr.branch_id = b.id 
           WHERE b.reporting_entity_id = $1 AND sr.created_at >= CURRENT_DATE - INTERVAL '30 days') as str_reports_last_30_days,
          (SELECT COUNT(*) FROM ctr_reports cr 
           JOIN branches b ON cr.branch_id = b.id 
           WHERE b.reporting_entity_id = $1 AND cr.created_at >= CURRENT_DATE - INTERVAL '30 days') as ctr_reports_last_30_days,
          
          -- Pending reports
          (SELECT COUNT(*) FROM str_reports sr 
           JOIN branches b ON sr.branch_id = b.id 
           WHERE b.reporting_entity_id = $1 AND sr.status = 'DRAFT') as pending_str_reports,
          (SELECT COUNT(*) FROM ctr_reports cr 
           JOIN branches b ON cr.branch_id = b.id 
           WHERE b.reporting_entity_id = $1 AND cr.status = 'DRAFT') as pending_ctr_reports`,
        [reportingEntityId],
      )

      // Get recent activities
      const recentActivities = await pool.query(
        `SELECT 
          al.action,
          al.table_name,
          al.record_id,
          al.created_at,
          u.username,
          u.full_name
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        WHERE u.reporting_entity_id = $1
        ORDER BY al.created_at DESC
        LIMIT 10`,
        [reportingEntityId],
      )

      // Get monthly report trends (last 6 months)
      const monthlyTrends = await pool.query(
        `SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) FILTER (WHERE 'str_reports' = 'str_reports') as str_count,
          COUNT(*) FILTER (WHERE 'ctr_reports' = 'ctr_reports') as ctr_count
        FROM (
          SELECT created_at, 'str_reports' as report_type FROM str_reports sr
          JOIN branches b ON sr.branch_id = b.id
          WHERE b.reporting_entity_id = $1 AND sr.created_at >= CURRENT_DATE - INTERVAL '6 months'
          UNION ALL
          SELECT created_at, 'ctr_reports' as report_type FROM ctr_reports cr
          JOIN branches b ON cr.branch_id = b.id
          WHERE b.reporting_entity_id = $1 AND cr.created_at >= CURRENT_DATE - INTERVAL '6 months'
        ) combined_reports
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC`,
        [reportingEntityId],
      )

      return {
        entityName,
        statistics: stats.rows[0],
        recentActivities: recentActivities.rows,
        monthlyTrends: monthlyTrends.rows,
      }
    } catch (error) {
      logger.error("Error fetching intermediate admin dashboard stats", error)
      throw error
    }
  }

  // Create data encoder user
  async createDataEncoder(userData, createdBy) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Get creator's reporting entity
      const creator = await client.query("SELECT reporting_entity_id FROM users WHERE id = $1", [createdBy])

      if (creator.rows.length === 0) {
        throw new Error("Creator not found")
      }

      const reportingEntityId = creator.rows[0].reporting_entity_id

      const { username, email, fullName, phoneNumber, branchId, isActive = true, sendCredentials = true } = userData

      // Check if username already exists
      const existingUser = await client.query("SELECT id FROM users WHERE username = $1", [username])

      if (existingUser.rows.length > 0) {
        throw new Error("Username already exists")
      }

      // Check if email already exists
      const existingEmail = await client.query("SELECT id FROM users WHERE email = $1", [email])

      if (existingEmail.rows.length > 0) {
        throw new Error("Email already exists")
      }

      // Verify branch belongs to the same reporting entity
      const branch = await client.query(
        "SELECT id FROM branches WHERE id = $1 AND reporting_entity_id = $2 AND is_active = true",
        [branchId, reportingEntityId],
      )

      if (branch.rows.length === 0) {
        throw new Error("Invalid branch or branch does not belong to your entity")
      }

      // Generate random password
      const tempPassword = generateRandomPassword()
      const hashedPassword = await bcrypt.hash(tempPassword, Number.parseInt(process.env.BCRYPT_ROUNDS) || 12)

      const result = await client.query(
        `INSERT INTO users (
          username, email, password_hash, full_name, phone_number, role, 
          reporting_entity_id, branch_id, is_active, must_change_password,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING id, username, email, full_name, phone_number, role, is_active, created_at`,
        [
          username,
          email,
          hashedPassword,
          fullName,
          phoneNumber,
          "DATA_ENCODER",
          reportingEntityId,
          branchId,
          isActive,
          true,
          createdBy,
        ],
      )

      await client.query("COMMIT")

      const newUser = result.rows[0]
      logger.info("Data encoder created successfully", { userId: newUser.id, createdBy })

      // Return user data with temporary password if needed
      return {
        ...newUser,
        ...(sendCredentials && { temporaryPassword: tempPassword }),
      }
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error creating data encoder", error)
      throw error
    } finally {
      client.release()
    }
  }

  // Get data encoders for intermediate admin's entity
  async getDataEncoders(userId, filters = {}) {
    try {
      // Get user's reporting entity
      const userInfo = await pool.query("SELECT reporting_entity_id FROM users WHERE id = $1", [userId])

      if (userInfo.rows.length === 0) {
        throw new Error("User not found")
      }

      const reportingEntityId = userInfo.rows[0].reporting_entity_id

      const {
        page = 1,
        limit = 10,
        search = "",
        branchId,
        isActive,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = filters

      const offset = (page - 1) * limit
      const whereConditions = [`u.reporting_entity_id = $1`, `u.role = 'DATA_ENCODER'`]
      const queryParams = [reportingEntityId]
      let paramCount = 1

      // Build WHERE conditions
      if (search) {
        paramCount++
        whereConditions.push(
          `(u.full_name ILIKE $${paramCount} OR u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`,
        )
        queryParams.push(`%${search}%`)
      }

      if (branchId) {
        paramCount++
        whereConditions.push(`u.branch_id = $${paramCount}`)
        queryParams.push(branchId)
      }

      if (isActive !== undefined) {
        paramCount++
        whereConditions.push(`u.is_active = $${paramCount}`)
        queryParams.push(isActive)
      }

      const whereClause = `WHERE ${whereConditions.join(" AND ")}`

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        ${whereClause}
      `
      const countResult = await pool.query(countQuery, queryParams)
      const total = Number.parseInt(countResult.rows[0].total)

      // Get users
      const dataQuery = `
        SELECT 
          u.id, u.username, u.email, u.full_name, u.phone_number, u.is_active,
          u.last_login_at, u.created_at, u.updated_at,
          b.branch_name, b.branch_code,
          (SELECT COUNT(*) FROM str_reports WHERE created_by = u.id) as str_reports_count,
          (SELECT COUNT(*) FROM ctr_reports WHERE created_by = u.id) as ctr_reports_count
        FROM users u
        LEFT JOIN branches b ON u.branch_id = b.id
        ${whereClause}
        ORDER BY u.${sortBy} ${sortOrder}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `

      queryParams.push(limit, offset)
      const result = await pool.query(dataQuery, queryParams)

      return {
        users: result.rows,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error("Error fetching data encoders", error)
      throw error
    }
  }

  // Update data encoder
  async updateDataEncoder(userId, updateData, updatedBy) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Get updater's reporting entity
      const updater = await client.query("SELECT reporting_entity_id FROM users WHERE id = $1", [updatedBy])

      if (updater.rows.length === 0) {
        throw new Error("Updater not found")
      }

      const reportingEntityId = updater.rows[0].reporting_entity_id

      // Check if user exists and belongs to same entity
      const existingUser = await client.query(
        "SELECT * FROM users WHERE id = $1 AND reporting_entity_id = $2 AND role = 'DATA_ENCODER'",
        [userId, reportingEntityId],
      )

      if (existingUser.rows.length === 0) {
        throw new Error("Data encoder not found or access denied")
      }

      const { email, fullName, phoneNumber, branchId, isActive } = updateData

      // Check if email already exists (excluding current user)
      if (email) {
        const duplicateEmail = await client.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, userId])

        if (duplicateEmail.rows.length > 0) {
          throw new Error("Email already exists")
        }
      }

      // Verify branch belongs to the same reporting entity if provided
      if (branchId) {
        const branch = await client.query(
          "SELECT id FROM branches WHERE id = $1 AND reporting_entity_id = $2 AND is_active = true",
          [branchId, reportingEntityId],
        )

        if (branch.rows.length === 0) {
          throw new Error("Invalid branch or branch does not belong to your entity")
        }
      }

      const result = await client.query(
        `UPDATE users SET
          email = COALESCE($1, email),
          full_name = COALESCE($2, full_name),
          phone_number = COALESCE($3, phone_number),
          branch_id = COALESCE($4, branch_id),
          is_active = COALESCE($5, is_active),
          updated_by = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING id, username, email, full_name, phone_number, is_active, updated_at`,
        [email, fullName, phoneNumber, branchId, isActive, updatedBy, userId],
      )

      await client.query("COMMIT")
      logger.info("Data encoder updated successfully", { userId, updatedBy })
      return result.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error updating data encoder", error)
      throw error
    } finally {
      client.release()
    }
  }

  // Reset data encoder password
  async resetDataEncoderPassword(userId, resetBy) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Get resetter's reporting entity
      const resetter = await client.query("SELECT reporting_entity_id FROM users WHERE id = $1", [resetBy])

      if (resetter.rows.length === 0) {
        throw new Error("Resetter not found")
      }

      const reportingEntityId = resetter.rows[0].reporting_entity_id

      // Check if user exists and belongs to same entity
      const existingUser = await client.query(
        "SELECT id, username, email FROM users WHERE id = $1 AND reporting_entity_id = $2 AND role = 'DATA_ENCODER'",
        [userId, reportingEntityId],
      )

      if (existingUser.rows.length === 0) {
        throw new Error("Data encoder not found or access denied")
      }

      // Generate new random password
      const newPassword = generateRandomPassword()
      const hashedPassword = await bcrypt.hash(newPassword, Number.parseInt(process.env.BCRYPT_ROUNDS) || 12)

      await client.query(
        `UPDATE users SET
          password_hash = $1,
          must_change_password = true,
          updated_by = $2,
          updated_at = NOW()
        WHERE id = $3`,
        [hashedPassword, resetBy, userId],
      )

      await client.query("COMMIT")
      logger.info("Data encoder password reset successfully", { userId, resetBy })

      return {
        message: "Password reset successfully",
        temporaryPassword: newPassword,
        user: existingUser.rows[0],
      }
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error resetting data encoder password", error)
      throw error
    } finally {
      client.release()
    }
  }
}

module.exports = new IntermediateAdminService()
