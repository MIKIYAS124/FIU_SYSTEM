const { pool } = require("../utils/database")
const { logger } = require("../utils/logger")

class BranchService {
  // Create a new branch
  async createBranch(branchData, createdBy) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const {
        branchName,
        branchCode,
        reportingEntityId,
        address,
        city,
        region,
        country,
        phoneNumber,
        email,
        managerName,
        managerPhone,
        managerEmail,
        isActive = true,
      } = branchData

      // Check if branch code already exists
      const existingBranch = await client.query("SELECT id FROM branches WHERE branch_code = $1", [branchCode])

      if (existingBranch.rows.length > 0) {
        throw new Error("Branch code already exists")
      }

      // Verify reporting entity exists
      const reportingEntity = await client.query(
        "SELECT id FROM reporting_entities WHERE id = $1 AND is_active = true",
        [reportingEntityId],
      )

      if (reportingEntity.rows.length === 0) {
        throw new Error("Invalid reporting entity")
      }

      const result = await client.query(
        `INSERT INTO branches (
          branch_name, branch_code, reporting_entity_id, address, city, region, 
          country, phone_number, email, manager_name, manager_phone, manager_email, 
          is_active, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *`,
        [
          branchName,
          branchCode,
          reportingEntityId,
          address,
          city,
          region,
          country,
          phoneNumber,
          email,
          managerName,
          managerPhone,
          managerEmail,
          isActive,
          createdBy,
        ],
      )

      await client.query("COMMIT")
      logger.info("Branch created successfully", { branchId: result.rows[0].id, createdBy })
      return result.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error creating branch", error)
      throw error
    } finally {
      client.release()
    }
  }

  // Get branches with pagination and filtering
  async getBranches(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        reportingEntityId,
        region,
        isActive,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = filters

      const offset = (page - 1) * limit
      const whereConditions = []
      const queryParams = []
      let paramCount = 0

      // Build WHERE conditions
      if (search) {
        paramCount++
        whereConditions.push(`(b.branch_name ILIKE $${paramCount} OR b.branch_code ILIKE $${paramCount})`)
        queryParams.push(`%${search}%`)
      }

      if (reportingEntityId) {
        paramCount++
        whereConditions.push(`b.reporting_entity_id = $${paramCount}`)
        queryParams.push(reportingEntityId)
      }

      if (region) {
        paramCount++
        whereConditions.push(`b.region = $${paramCount}`)
        queryParams.push(region)
      }

      if (isActive !== undefined) {
        paramCount++
        whereConditions.push(`b.is_active = $${paramCount}`)
        queryParams.push(isActive)
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM branches b
        LEFT JOIN reporting_entities re ON b.reporting_entity_id = re.id
        ${whereClause}
      `
      const countResult = await pool.query(countQuery, queryParams)
      const total = Number.parseInt(countResult.rows[0].total)

      // Get branches
      const dataQuery = `
        SELECT 
          b.*,
          re.entity_name as reporting_entity_name,
          (SELECT COUNT(*) FROM users WHERE branch_id = b.id AND is_active = true) as active_users_count
        FROM branches b
        LEFT JOIN reporting_entities re ON b.reporting_entity_id = re.id
        ${whereClause}
        ORDER BY b.${sortBy} ${sortOrder}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `

      queryParams.push(limit, offset)
      const result = await pool.query(dataQuery, queryParams)

      return {
        branches: result.rows,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error("Error fetching branches", error)
      throw error
    }
  }

  // Get single branch by ID
  async getBranchById(id) {
    try {
      const result = await pool.query(
        `SELECT 
          b.*,
          re.entity_name as reporting_entity_name,
          (SELECT COUNT(*) FROM users WHERE branch_id = b.id AND is_active = true) as active_users_count,
          (SELECT COUNT(*) FROM str_reports WHERE branch_id = b.id) as str_reports_count,
          (SELECT COUNT(*) FROM ctr_reports WHERE branch_id = b.id) as ctr_reports_count
        FROM branches b
        LEFT JOIN reporting_entities re ON b.reporting_entity_id = re.id
        WHERE b.id = $1`,
        [id],
      )

      if (result.rows.length === 0) {
        throw new Error("Branch not found")
      }

      return result.rows[0]
    } catch (error) {
      logger.error("Error fetching branch", error)
      throw error
    }
  }

  // Update branch
  async updateBranch(id, updateData, updatedBy) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Check if branch exists
      const existingBranch = await client.query("SELECT * FROM branches WHERE id = $1", [id])
      if (existingBranch.rows.length === 0) {
        throw new Error("Branch not found")
      }

      const {
        branchName,
        branchCode,
        reportingEntityId,
        address,
        city,
        region,
        country,
        phoneNumber,
        email,
        managerName,
        managerPhone,
        managerEmail,
        isActive,
      } = updateData

      // Check if branch code already exists (excluding current branch)
      if (branchCode) {
        const duplicateCheck = await client.query("SELECT id FROM branches WHERE branch_code = $1 AND id != $2", [
          branchCode,
          id,
        ])

        if (duplicateCheck.rows.length > 0) {
          throw new Error("Branch code already exists")
        }
      }

      // Verify reporting entity exists if provided
      if (reportingEntityId) {
        const reportingEntity = await client.query(
          "SELECT id FROM reporting_entities WHERE id = $1 AND is_active = true",
          [reportingEntityId],
        )

        if (reportingEntity.rows.length === 0) {
          throw new Error("Invalid reporting entity")
        }
      }

      const result = await client.query(
        `UPDATE branches SET
          branch_name = COALESCE($1, branch_name),
          branch_code = COALESCE($2, branch_code),
          reporting_entity_id = COALESCE($3, reporting_entity_id),
          address = COALESCE($4, address),
          city = COALESCE($5, city),
          region = COALESCE($6, region),
          country = COALESCE($7, country),
          phone_number = COALESCE($8, phone_number),
          email = COALESCE($9, email),
          manager_name = COALESCE($10, manager_name),
          manager_phone = COALESCE($11, manager_phone),
          manager_email = COALESCE($12, manager_email),
          is_active = COALESCE($13, is_active),
          updated_by = $14,
          updated_at = NOW()
        WHERE id = $15
        RETURNING *`,
        [
          branchName,
          branchCode,
          reportingEntityId,
          address,
          city,
          region,
          country,
          phoneNumber,
          email,
          managerName,
          managerPhone,
          managerEmail,
          isActive,
          updatedBy,
          id,
        ],
      )

      await client.query("COMMIT")
      logger.info("Branch updated successfully", { branchId: id, updatedBy })
      return result.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error updating branch", error)
      throw error
    } finally {
      client.release()
    }
  }

  // Delete branch (soft delete)
  async deleteBranch(id, deletedBy) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Check if branch exists
      const existingBranch = await client.query("SELECT * FROM branches WHERE id = $1", [id])
      if (existingBranch.rows.length === 0) {
        throw new Error("Branch not found")
      }

      // Check if branch has active users
      const activeUsers = await client.query(
        "SELECT COUNT(*) as count FROM users WHERE branch_id = $1 AND is_active = true",
        [id],
      )

      if (Number.parseInt(activeUsers.rows[0].count) > 0) {
        throw new Error("Cannot delete branch with active users")
      }

      // Check if branch has reports
      const hasReports = await client.query(
        "SELECT COUNT(*) as count FROM (SELECT id FROM str_reports WHERE branch_id = $1 UNION SELECT id FROM ctr_reports WHERE branch_id = $1) as reports",
        [id],
      )

      if (Number.parseInt(hasReports.rows[0].count) > 0) {
        throw new Error("Cannot delete branch with existing reports")
      }

      // Soft delete
      await client.query("UPDATE branches SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2", [
        deletedBy,
        id,
      ])

      await client.query("COMMIT")
      logger.info("Branch deleted successfully", { branchId: id, deletedBy })
      return { message: "Branch deleted successfully" }
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error deleting branch", error)
      throw error
    } finally {
      client.release()
    }
  }

  // Get branch statistics
  async getBranchStatistics(branchId) {
    try {
      const result = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM users WHERE branch_id = $1 AND is_active = true) as active_users,
          (SELECT COUNT(*) FROM str_reports WHERE branch_id = $1) as total_str_reports,
          (SELECT COUNT(*) FROM ctr_reports WHERE branch_id = $1) as total_ctr_reports,
          (SELECT COUNT(*) FROM str_reports WHERE branch_id = $1 AND status = 'SUBMITTED') as submitted_str_reports,
          (SELECT COUNT(*) FROM ctr_reports WHERE branch_id = $1 AND status = 'SUBMITTED') as submitted_ctr_reports,
          (SELECT COUNT(*) FROM str_reports WHERE branch_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days') as str_reports_last_30_days,
          (SELECT COUNT(*) FROM ctr_reports WHERE branch_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days') as ctr_reports_last_30_days`,
        [branchId],
      )

      return result.rows[0]
    } catch (error) {
      logger.error("Error fetching branch statistics", error)
      throw error
    }
  }

  // Get branches dropdown for forms
  async getBranchesDropdown(reportingEntityId = null) {
    try {
      let query = `
        SELECT id, branch_name, branch_code, reporting_entity_id
        FROM branches 
        WHERE is_active = true
      `
      const params = []

      if (reportingEntityId) {
        query += " AND reporting_entity_id = $1"
        params.push(reportingEntityId)
      }

      query += " ORDER BY branch_name"

      const result = await pool.query(query, params)
      return result.rows
    } catch (error) {
      logger.error("Error fetching branches dropdown", error)
      throw error
    }
  }
}

module.exports = new BranchService()
