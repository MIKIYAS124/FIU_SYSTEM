const branchService = require("../services/branchService")
const intermediateAdminService = require("../services/intermediateAdminService")
const { ResponseHelper } = require("../utils/response")
const { logger } = require("../utils/logger")
const { pool } = require("../db")

class IntermediateAdminController {
  // Dashboard
  async getDashboard(req, res) {
    try {
      const userId = req.user.id
      const dashboardData = await intermediateAdminService.getDashboardStats(userId)
      ResponseHelper.success(res, "Dashboard data retrieved successfully", dashboardData)
    } catch (error) {
      logger.error("Error fetching intermediate admin dashboard", error)
      ResponseHelper.serverError(res, error.message)
    }
  }

  // Branch Management
  async createBranch(req, res) {
    try {
      const createdBy = req.user.id
      const branch = await branchService.createBranch(req.body, createdBy)
      ResponseHelper.created(res, "Branch created successfully", branch)
    } catch (error) {
      logger.error("Error creating branch", error)
      if (error.message.includes("already exists")) {
        ResponseHelper.badRequest(res, error.message)
      } else if (error.message.includes("Invalid")) {
        ResponseHelper.badRequest(res, error.message)
      } else {
        ResponseHelper.serverError(res, error.message)
      }
    }
  }

  async getBranches(req, res) {
    try {
      const userId = req.user.id

      // Get user's reporting entity to filter branches
      const userInfo = await pool.query("SELECT reporting_entity_id FROM users WHERE id = $1", [userId])

      if (userInfo.rows.length === 0) {
        return ResponseHelper.notFound(res, "User not found")
      }

      const filters = {
        ...req.query,
        reportingEntityId: userInfo.rows[0].reporting_entity_id,
      }

      const result = await branchService.getBranches(filters)
      ResponseHelper.success(res, "Branches retrieved successfully", result)
    } catch (error) {
      logger.error("Error fetching branches", error)
      ResponseHelper.serverError(res, error.message)
    }
  }

  async getBranch(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Verify branch belongs to user's entity
      const userInfo = await pool.query("SELECT reporting_entity_id FROM users WHERE id = $1", [userId])

      const branch = await branchService.getBranchById(id)

      // Check if branch belongs to user's reporting entity
      if (branch.reporting_entity_id !== userInfo.rows[0].reporting_entity_id) {
        return ResponseHelper.forbidden(res, "Access denied to this branch")
      }

      ResponseHelper.success(res, "Branch retrieved successfully", branch)
    } catch (error) {
      logger.error("Error fetching branch", error)
      if (error.message === "Branch not found") {
        ResponseHelper.notFound(res, error.message)
      } else {
        ResponseHelper.serverError(res, error.message)
      }
    }
  }

  async updateBranch(req, res) {
    try {
      const { id } = req.params
      const updatedBy = req.user.id
      const userId = req.user.id

      // Verify branch belongs to user's entity
      const userInfo = await pool.query("SELECT reporting_entity_id FROM users WHERE id = $1", [userId])

      const existingBranch = await branchService.getBranchById(id)

      if (existingBranch.reporting_entity_id !== userInfo.rows[0].reporting_entity_id) {
        return ResponseHelper.forbidden(res, "Access denied to this branch")
      }

      const branch = await branchService.updateBranch(id, req.body, updatedBy)
      ResponseHelper.success(res, "Branch updated successfully", branch)
    } catch (error) {
      logger.error("Error updating branch", error)
      if (error.message === "Branch not found") {
        ResponseHelper.notFound(res, error.message)
      } else if (error.message.includes("already exists")) {
        ResponseHelper.badRequest(res, error.message)
      } else {
        ResponseHelper.serverError(res, error.message)
      }
    }
  }

  async deleteBranch(req, res) {
    try {
      const { id } = req.params
      const deletedBy = req.user.id
      const userId = req.user.id

      // Verify branch belongs to user's entity
      const userInfo = await pool.query("SELECT reporting_entity_id FROM users WHERE id = $1", [userId])

      const existingBranch = await branchService.getBranchById(id)

      if (existingBranch.reporting_entity_id !== userInfo.rows[0].reporting_entity_id) {
        return ResponseHelper.forbidden(res, "Access denied to this branch")
      }

      const result = await branchService.deleteBranch(id, deletedBy)
      ResponseHelper.success(res, result.message)
    } catch (error) {
      logger.error("Error deleting branch", error)
      if (error.message === "Branch not found") {
        ResponseHelper.notFound(res, error.message)
      } else if (error.message.includes("Cannot delete")) {
        ResponseHelper.badRequest(res, error.message)
      } else {
        ResponseHelper.serverError(res, error.message)
      }
    }
  }

  async getBranchStatistics(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Verify branch belongs to user's entity
      const userInfo = await pool.query("SELECT reporting_entity_id FROM users WHERE id = $1", [userId])

      const branch = await branchService.getBranchById(id)

      if (branch.reporting_entity_id !== userInfo.rows[0].reporting_entity_id) {
        return ResponseHelper.forbidden(res, "Access denied to this branch")
      }

      const statistics = await branchService.getBranchStatistics(id)
      ResponseHelper.success(res, "Branch statistics retrieved successfully", statistics)
    } catch (error) {
      logger.error("Error fetching branch statistics", error)
      ResponseHelper.serverError(res, error.message)
    }
  }

  // Data Encoder Management
  async createDataEncoder(req, res) {
    try {
      const createdBy = req.user.id
      const user = await intermediateAdminService.createDataEncoder(req.body, createdBy)
      ResponseHelper.created(res, "Data encoder created successfully", user)
    } catch (error) {
      logger.error("Error creating data encoder", error)
      if (error.message.includes("already exists")) {
        ResponseHelper.badRequest(res, error.message)
      } else if (error.message.includes("Invalid")) {
        ResponseHelper.badRequest(res, error.message)
      } else {
        ResponseHelper.serverError(res, error.message)
      }
    }
  }

  async getDataEncoders(req, res) {
    try {
      const userId = req.user.id
      const result = await intermediateAdminService.getDataEncoders(userId, req.query)
      ResponseHelper.success(res, "Data encoders retrieved successfully", result)
    } catch (error) {
      logger.error("Error fetching data encoders", error)
      ResponseHelper.serverError(res, error.message)
    }
  }

  async updateDataEncoder(req, res) {
    try {
      const { id } = req.params
      const updatedBy = req.user.id
      const user = await intermediateAdminService.updateDataEncoder(id, req.body, updatedBy)
      ResponseHelper.success(res, "Data encoder updated successfully", user)
    } catch (error) {
      logger.error("Error updating data encoder", error)
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        ResponseHelper.notFound(res, error.message)
      } else if (error.message.includes("already exists")) {
        ResponseHelper.badRequest(res, error.message)
      } else {
        ResponseHelper.serverError(res, error.message)
      }
    }
  }

  async resetDataEncoderPassword(req, res) {
    try {
      const { id } = req.params
      const resetBy = req.user.id
      const result = await intermediateAdminService.resetDataEncoderPassword(id, resetBy)
      ResponseHelper.success(res, result.message, {
        temporaryPassword: result.temporaryPassword,
        user: result.user,
      })
    } catch (error) {
      logger.error("Error resetting data encoder password", error)
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        ResponseHelper.notFound(res, error.message)
      } else {
        ResponseHelper.serverError(res, error.message)
      }
    }
  }
}

module.exports = new IntermediateAdminController()
