const notificationService = require("../services/notificationService")
const { ResponseHelper } = require("../utils/response")
const { logger } = require("../utils/logger")
const { validationResult } = require("express-validator")

class NotificationController {
  // Get user notifications
  async getNotifications(req, res) {
    try {
      const userId = req.user.id
      const filters = req.query

      const result = await notificationService.getUserNotifications(userId, filters)

      ResponseHelper.success(res, "Notifications retrieved successfully", result)
    } catch (error) {
      logger.error("Error fetching notifications", error)
      ResponseHelper.serverError(res, "Failed to fetch notifications")
    }
  }

  // Get notification counts
  async getNotificationCounts(req, res) {
    try {
      const userId = req.user.id

      const counts = await notificationService.getNotificationCounts(userId)

      ResponseHelper.success(res, "Notification counts retrieved successfully", counts)
    } catch (error) {
      logger.error("Error fetching notification counts", error)
      ResponseHelper.serverError(res, "Failed to fetch notification counts")
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const notification = await notificationService.markAsRead(id, userId)

      ResponseHelper.success(res, "Notification marked as read", notification)
    } catch (error) {
      logger.error("Error marking notification as read", error)

      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to mark notification as read")
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id

      const result = await notificationService.markAllAsRead(userId)

      ResponseHelper.success(res, "All notifications marked as read", result)
    } catch (error) {
      logger.error("Error marking all notifications as read", error)
      ResponseHelper.serverError(res, "Failed to mark all notifications as read")
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      await notificationService.deleteNotification(id, userId)

      ResponseHelper.success(res, "Notification deleted successfully")
    } catch (error) {
      logger.error("Error deleting notification", error)

      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return ResponseHelper.notFound(res, error.message)
      }

      ResponseHelper.serverError(res, "Failed to delete notification")
    }
  }

  // Create system notification (Super Admin only)
  async createSystemNotification(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.validationError(res, "Validation failed", errors.array())
      }

      const { title, message, priority, targetRoles } = req.body

      const notifications = await notificationService.createSystemNotification(
        { title, message, priority, type: "SYSTEM" },
        targetRoles,
      )

      ResponseHelper.success(res, "System notification created successfully", {
        count: notifications.length,
      })
    } catch (error) {
      logger.error("Error creating system notification", error)
      ResponseHelper.serverError(res, "Failed to create system notification")
    }
  }

  // WebSocket connection handler
  handleWebSocketConnection(ws, req) {
    const userId = req.user?.id

    if (!userId) {
      ws.close(1008, "Authentication required")
      return
    }

    notificationService.addConnection(userId, ws)

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message)

        // Handle different message types
        switch (data.type) {
          case "ping":
            ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }))
            break
          case "mark_read":
            if (data.notificationId) {
              notificationService.markAsRead(data.notificationId, userId).catch((error) => {
                logger.error("Error marking notification as read via WebSocket", error)
              })
            }
            break
          default:
            logger.warn("Unknown WebSocket message type", { type: data.type, userId })
        }
      } catch (error) {
        logger.error("Error processing WebSocket message", error)
      }
    })

    ws.on("error", (error) => {
      logger.error("WebSocket error", { error, userId })
    })

    // Send initial notification counts
    notificationService
      .getNotificationCounts(userId)
      .then((counts) => {
        ws.send(
          JSON.stringify({
            event: "notification_counts",
            data: counts,
            timestamp: new Date().toISOString(),
          }),
        )
      })
      .catch((error) => {
        logger.error("Error sending initial notification counts", error)
      })
  }
}

module.exports = new NotificationController()
