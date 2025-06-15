const express = require("express")
const { ReportingEntityService } = require("../services/reportingEntityService")
const { TransactionMannerService } = require("../services/transactionMannerService")
const { CrimeTypeService } = require("../services/crimeTypeService")
const { DashboardService } = require("../services/dashboardService")
const { ResponseHelper } = require("../utils/response")
const { authenticate } = require("../middleware/auth")
const { logger } = require("../utils/logger")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticate)

// Dropdown data endpoints
router.get("/reporting-entities/dropdown", async (req, res) => {
  try {
    const entities = await ReportingEntityService.getReportingEntitiesDropdown()
    ResponseHelper.success(res, "Reporting entities dropdown retrieved successfully", entities)
  } catch (error) {
    logger.error("Get reporting entities dropdown error", { error: error.message })
    ResponseHelper.serverError(res, "Failed to retrieve reporting entities dropdown")
  }
})

router.get("/transaction-manners/dropdown", async (req, res) => {
  try {
    const manners = await TransactionMannerService.getTransactionMannersDropdown()
    ResponseHelper.success(res, "Transaction manners dropdown retrieved successfully", manners)
  } catch (error) {
    logger.error("Get transaction manners dropdown error", { error: error.message })
    ResponseHelper.serverError(res, "Failed to retrieve transaction manners dropdown")
  }
})

router.get("/crime-types/dropdown", async (req, res) => {
  try {
    const crimes = await CrimeTypeService.getCrimeTypesDropdown()
    ResponseHelper.success(res, "Crime types dropdown retrieved successfully", crimes)
  } catch (error) {
    logger.error("Get crime types dropdown error", { error: error.message })
    ResponseHelper.serverError(res, "Failed to retrieve crime types dropdown")
  }
})

// System health endpoint
router.get("/system/health", async (req, res) => {
  try {
    const health = await DashboardService.getSystemHealth()
    ResponseHelper.success(res, "System health retrieved successfully", health)
  } catch (error) {
    logger.error("Get system health error", { error: error.message })
    ResponseHelper.serverError(res, "Failed to retrieve system health")
  }
})

// Constants/Enums endpoints
router.get("/constants/user-roles", (req, res) => {
  const roles = [
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "INTERMEDIATE_ADMIN", label: "Intermediate Admin" },
    { value: "DATA_ENCODER", label: "Data Encoder" },
  ]
  ResponseHelper.success(res, "User roles retrieved successfully", roles)
})

router.get("/constants/entity-status", (req, res) => {
  const statuses = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ]
  ResponseHelper.success(res, "Entity statuses retrieved successfully", statuses)
})

router.get("/constants/severity-levels", (req, res) => {
  const levels = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
  ]
  ResponseHelper.success(res, "Severity levels retrieved successfully", levels)
})

router.get("/constants/transaction-types", (req, res) => {
  const types = [
    { value: "WITHDRAWAL", label: "Withdrawal" },
    { value: "DEPOSIT", label: "Deposit" },
    { value: "TRANSFER", label: "Transfer" },
  ]
  ResponseHelper.success(res, "Transaction types retrieved successfully", types)
})

router.get("/constants/address-types", (req, res) => {
  const types = [
    { value: "KNOWN", label: "Known" },
    { value: "UNKNOWN", label: "Unknown" },
    { value: "OTHER", label: "Other" },
  ]
  ResponseHelper.success(res, "Address types retrieved successfully", types)
})

module.exports = router
