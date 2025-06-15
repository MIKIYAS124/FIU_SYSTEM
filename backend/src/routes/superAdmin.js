const express = require("express")
const { SuperAdminController } = require("../controllers/superAdminController")
const { authenticate, authorize } = require("../middleware/auth")
const { handleValidationErrors } = require("../middleware/validation")
const { auditLog } = require("../middleware/audit")

const router = express.Router()

// Apply authentication and authorization to all routes
router.use(authenticate)
router.use(authorize("SUPER_ADMIN"))

// Dashboard
router.get("/dashboard", SuperAdminController.getDashboard)

// Reporting Entities Routes
router.post(
  "/reporting-entities",
  SuperAdminController.reportingEntityValidation,
  handleValidationErrors,
  auditLog("CREATE_REPORTING_ENTITY"),
  SuperAdminController.createReportingEntity,
)

router.get("/reporting-entities", SuperAdminController.getReportingEntities)

router.get("/reporting-entities/:id", SuperAdminController.getReportingEntity)

router.put(
  "/reporting-entities/:id",
  SuperAdminController.reportingEntityValidation,
  handleValidationErrors,
  auditLog("UPDATE_REPORTING_ENTITY"),
  SuperAdminController.updateReportingEntity,
)

router.delete(
  "/reporting-entities/:id",
  auditLog("DELETE_REPORTING_ENTITY"),
  SuperAdminController.deleteReportingEntity,
)

// Transaction Manners Routes
router.post(
  "/transaction-manners",
  SuperAdminController.transactionMannerValidation,
  handleValidationErrors,
  auditLog("CREATE_TRANSACTION_MANNER"),
  SuperAdminController.createTransactionManner,
)

router.get("/transaction-manners", SuperAdminController.getTransactionManners)

router.get("/transaction-manners/:id", SuperAdminController.getTransactionManner)

router.put(
  "/transaction-manners/:id",
  SuperAdminController.transactionMannerValidation,
  handleValidationErrors,
  auditLog("UPDATE_TRANSACTION_MANNER"),
  SuperAdminController.updateTransactionManner,
)

router.delete(
  "/transaction-manners/:id",
  auditLog("DELETE_TRANSACTION_MANNER"),
  SuperAdminController.deleteTransactionManner,
)

// Crime Types Routes
router.post(
  "/crime-types",
  SuperAdminController.crimeTypeValidation,
  handleValidationErrors,
  auditLog("CREATE_CRIME_TYPE"),
  SuperAdminController.createCrimeType,
)

router.get("/crime-types", SuperAdminController.getCrimeTypes)

router.get("/crime-types/:id", SuperAdminController.getCrimeType)

router.put(
  "/crime-types/:id",
  SuperAdminController.crimeTypeValidation,
  handleValidationErrors,
  auditLog("UPDATE_CRIME_TYPE"),
  SuperAdminController.updateCrimeType,
)

router.delete("/crime-types/:id", auditLog("DELETE_CRIME_TYPE"), SuperAdminController.deleteCrimeType)

// User Management Routes
router.post(
  "/users",
  SuperAdminController.userValidation,
  handleValidationErrors,
  auditLog("CREATE_USER"),
  SuperAdminController.createUser,
)

router.get("/users", SuperAdminController.getUsers)

router.get("/users/:id", SuperAdminController.getUser)

router.put(
  "/users/:id",
  SuperAdminController.userUpdateValidation,
  handleValidationErrors,
  auditLog("UPDATE_USER"),
  SuperAdminController.updateUser,
)

router.delete("/users/:id", auditLog("DELETE_USER"), SuperAdminController.deleteUser)

module.exports = router
