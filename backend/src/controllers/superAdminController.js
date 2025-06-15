const { body, param, query } = require("express-validator")
const { ReportingEntityService } = require("../services/reportingEntityService")
const { TransactionMannerService } = require("../services/transactionMannerService")
const { CrimeTypeService } = require("../services/crimeTypeService")
const { UserService } = require("../services/userService")
const { DashboardService } = require("../services/dashboardService")
const { ResponseHelper } = require("../utils/response")
const { handleValidationErrors } = require("../middleware/validation")
const { logger } = require("../utils/logger")

class SuperAdminController {
  // Dashboard
  static async getDashboard(req, res) {
    try {
      const stats = await DashboardService.getSuperAdminStats()
      ResponseHelper.success(res, "Dashboard statistics retrieved successfully", stats)
    } catch (error) {
      logger.error("Get super admin dashboard error", { error: error.message })
      ResponseHelper.serverError(res, "Failed to retrieve dashboard statistics")
    }
  }

  // Reporting Entities
  static reportingEntityValidation = [
    body("entityName").notEmpty().withMessage("Entity name is required"),
    body("taxId").notEmpty().withMessage("Tax ID is required"),
    body("businessType").notEmpty().withMessage("Business type is required"),
    body("issuingCountry").notEmpty().withMessage("Issuing country is required"),
    body("registrationNumber").notEmpty().withMessage("Registration number is required"),
    body("countryOfOrigin").notEmpty().withMessage("Country of origin is required"),
    body("country").notEmpty().withMessage("Country is required"),
  ]

  static async createReportingEntity(req, res) {
    try {
      const entity = await ReportingEntityService.createReportingEntity(req.body, req.user.id)
      ResponseHelper.success(res, "Reporting entity created successfully", entity, 201)
    } catch (error) {
      logger.error("Create reporting entity error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  static async getReportingEntities(req, res) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status,
        country: req.query.country,
        businessType: req.query.businessType,
      }

      const pagination = {
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await ReportingEntityService.getReportingEntities(filters, pagination)
      ResponseHelper.paginated(res, "Reporting entities retrieved successfully", result.entities, result.pagination)
    } catch (error) {
      logger.error("Get reporting entities error", { error: error.message })
      ResponseHelper.serverError(res, "Failed to retrieve reporting entities")
    }
  }

  static async getReportingEntity(req, res) {
    try {
      const entity = await ReportingEntityService.getReportingEntityById(req.params.id)
      ResponseHelper.success(res, "Reporting entity retrieved successfully", entity)
    } catch (error) {
      logger.error("Get reporting entity error", { error: error.message })
      ResponseHelper.error(res, error.message, null, 404)
    }
  }

  static async updateReportingEntity(req, res) {
    try {
      const entity = await ReportingEntityService.updateReportingEntity(req.params.id, req.body)
      ResponseHelper.success(res, "Reporting entity updated successfully", entity)
    } catch (error) {
      logger.error("Update reporting entity error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  static async deleteReportingEntity(req, res) {
    try {
      const result = await ReportingEntityService.deleteReportingEntity(req.params.id)
      ResponseHelper.success(res, result.message)
    } catch (error) {
      logger.error("Delete reporting entity error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  // Transaction Manners
  static transactionMannerValidation = [
    body("mannerName").notEmpty().withMessage("Transaction manner name is required"),
  ]

  static async createTransactionManner(req, res) {
    try {
      const manner = await TransactionMannerService.createTransactionManner(req.body, req.user.id)
      ResponseHelper.success(res, "Transaction manner created successfully", manner, 201)
    } catch (error) {
      logger.error("Create transaction manner error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  static async getTransactionManners(req, res) {
    try {
      const filters = {
        search: req.query.search,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
      }

      const pagination = {
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await TransactionMannerService.getTransactionManners(filters, pagination)
      ResponseHelper.paginated(res, "Transaction manners retrieved successfully", result.manners, result.pagination)
    } catch (error) {
      logger.error("Get transaction manners error", { error: error.message })
      ResponseHelper.serverError(res, "Failed to retrieve transaction manners")
    }
  }

  static async getTransactionManner(req, res) {
    try {
      const manner = await TransactionMannerService.getTransactionMannerById(req.params.id)
      ResponseHelper.success(res, "Transaction manner retrieved successfully", manner)
    } catch (error) {
      logger.error("Get transaction manner error", { error: error.message })
      ResponseHelper.error(res, error.message, null, 404)
    }
  }

  static async updateTransactionManner(req, res) {
    try {
      const manner = await TransactionMannerService.updateTransactionManner(req.params.id, req.body)
      ResponseHelper.success(res, "Transaction manner updated successfully", manner)
    } catch (error) {
      logger.error("Update transaction manner error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  static async deleteTransactionManner(req, res) {
    try {
      const result = await TransactionMannerService.deleteTransactionManner(req.params.id)
      ResponseHelper.success(res, result.message)
    } catch (error) {
      logger.error("Delete transaction manner error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  // Crime Types
  static crimeTypeValidation = [
    body("crimeName").notEmpty().withMessage("Crime name is required"),
    body("severityLevel").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).withMessage("Invalid severity level"),
  ]

  static async createCrimeType(req, res) {
    try {
      const crime = await CrimeTypeService.createCrimeType(req.body, req.user.id)
      ResponseHelper.success(res, "Crime type created successfully", crime, 201)
    } catch (error) {
      logger.error("Create crime type error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  static async getCrimeTypes(req, res) {
    try {
      const filters = {
        search: req.query.search,
        severityLevel: req.query.severityLevel,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
      }

      const pagination = {
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await CrimeTypeService.getCrimeTypes(filters, pagination)
      ResponseHelper.paginated(res, "Crime types retrieved successfully", result.crimes, result.pagination)
    } catch (error) {
      logger.error("Get crime types error", { error: error.message })
      ResponseHelper.serverError(res, "Failed to retrieve crime types")
    }
  }

  static async getCrimeType(req, res) {
    try {
      const crime = await CrimeTypeService.getCrimeTypeById(req.params.id)
      ResponseHelper.success(res, "Crime type retrieved successfully", crime)
    } catch (error) {
      logger.error("Get crime type error", { error: error.message })
      ResponseHelper.error(res, error.message, null, 404)
    }
  }

  static async updateCrimeType(req, res) {
    try {
      const crime = await CrimeTypeService.updateCrimeType(req.params.id, req.body)
      ResponseHelper.success(res, "Crime type updated successfully", crime)
    } catch (error) {
      logger.error("Update crime type error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  static async deleteCrimeType(req, res) {
    try {
      const result = await CrimeTypeService.deleteCrimeType(req.params.id)
      ResponseHelper.success(res, result.message)
    } catch (error) {
      logger.error("Delete crime type error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  // User Management
  static userValidation = [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("role").isIn(["INTERMEDIATE_ADMIN", "DATA_ENCODER"]).withMessage("Invalid role"),
  ]

  static async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body, req.user.id)
      ResponseHelper.success(res, "User created successfully", user, 201)
    } catch (error) {
      logger.error("Create user error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  static async getUsers(req, res) {
    try {
      const filters = {
        search: req.query.search,
        role: req.query.role,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
      }

      const pagination = {
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await UserService.getUsers(filters, pagination)
      ResponseHelper.paginated(res, "Users retrieved successfully", result.users, result.pagination)
    } catch (error) {
      logger.error("Get users error", { error: error.message })
      ResponseHelper.serverError(res, "Failed to retrieve users")
    }
  }

  static async getUser(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id)
      ResponseHelper.success(res, "User retrieved successfully", user)
    } catch (error) {
      logger.error("Get user error", { error: error.message })
      ResponseHelper.error(res, error.message, null, 404)
    }
  }

  static userUpdateValidation = [
    body("username").optional().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("firstName").optional().notEmpty().withMessage("First name cannot be empty"),
    body("lastName").optional().notEmpty().withMessage("Last name cannot be empty"),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
  ]

  static async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body, req.user.id)
      ResponseHelper.success(res, "User updated successfully", user)
    } catch (error) {
      logger.error("Update user error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }

  static async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id, req.user.id)
      ResponseHelper.success(res, result.message)
    } catch (error) {
      logger.error("Delete user error", { error: error.message })
      ResponseHelper.error(res, error.message)
    }
  }
}

module.exports = { SuperAdminController }
