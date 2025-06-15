const express = require("express")
const { body, param, query } = require("express-validator")
const notificationController = require("../controllers/notificationController")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Get user notifications
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("isRead").optional().isBoolean().withMessage("isRead must be a boolean"),
    query("type")
      .optional()
      .isIn(["REPORT_APPROVED", "REPORT_REJECTED", "REPORT_RETURNED", "SYSTEM", "USER_CREATED", "PASSWORD_RESET"])
      .withMessage("Invalid notification type"),
    query("priority").optional().isIn(["LOW", "NORMAL", "HIGH", "URGENT"]).withMessage("Invalid priority level"),
  ],
  notificationController.getNotifications,
)

// Get notification counts
router.get("/counts", notificationController.getNotificationCounts)

// Mark notification as read
router.patch(
  "/:id/read",
  [param("id").isInt({ min: 1 }).withMessage("Valid notification ID is required")],
  notificationController.markAsRead,
)

// Mark all notifications as read
router.patch("/read-all", notificationController.markAllAsRead)

// Delete notification
router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid notification ID is required")],
  notificationController.deleteNotification,
)

// Create system notification (Super Admin only)
router.post(
  "/system",
  requireRole(["SUPER_ADMIN"]),
  [
    body("title").notEmpty().withMessage("Title is required").isLength({ max: 255 }).withMessage("Title too long"),
    body("message")
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ max: 1000 })
      .withMessage("Message too long"),
    body("priority").optional().isIn(["LOW", "NORMAL", "HIGH", "URGENT"]).withMessage("Invalid priority level"),
    body("targetRoles")
      .optional()
      .isArray()
      .withMessage("Target roles must be an array")
      .custom((roles) => {
        const validRoles = ["SUPER_ADMIN", "INTERMEDIATE_ADMIN", "DATA_ENCODER"]
        return roles.every((role) => validRoles.includes(role))
      })
      .withMessage("Invalid role in target roles"),
  ],
  notificationController.createSystemNotification,
)

module.exports = router
