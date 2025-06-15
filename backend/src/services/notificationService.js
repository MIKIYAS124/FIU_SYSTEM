const { pool } = require("../utils/database")
const { logger } = require("../utils/logger")
const EventEmitter = require("events")

class NotificationService extends EventEmitter {
  constructor() {
    super()
    this.activeConnections = new Map() // Store WebSocket connections
  }

  // Create notification
  async createNotification(notificationData) {
    const client = await pool.connect()
    try {
      const { userId, type, title, message, metadata = {}, priority = "NORMAL" } = notificationData

      const query = `
        INSERT INTO notifications (
          user_id, type, title, message, metadata, priority, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `

      const result = await client.query(query, [userId, type, title, message, JSON.stringify(metadata), priority])

      const notification = result.rows[0]

      // Emit real-time notification if user is connected
      this.emitToUser(userId, "new_notification", notification)

      // Send email notification for high priority items
      if (priority === "HIGH" || priority === "URGENT") {
        await this.sendEmailNotification(userId, notification)
      }

      logger.info("Notification created", { notificationId: notification.id, userId, type })
      return notification
    } catch (error) {
      logger.error("Error creating notification", error)
      throw error
    } finally {
      client.release()
    }
  }

  // Get user notifications
  async getUserNotifications(userId, filters = {}) {
    try {
      const { page = 1, limit = 20, isRead, type, priority } = filters

      const whereConditions = ["user_id = $1"]
      const queryParams = [userId]
      let paramIndex = 2

      if (typeof isRead === "boolean") {
        whereConditions.push(`is_read = $${paramIndex}`)
        queryParams.push(isRead)
        paramIndex++
      }

      if (type) {
        whereConditions.push(`type = $${paramIndex}`)
        queryParams.push(type)
        paramIndex++
      }

      if (priority) {
        whereConditions.push(`priority = $${paramIndex}`)
        queryParams.push(priority)
        paramIndex++
      }

      const whereClause = `WHERE ${whereConditions.join(" AND ")}`

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM notifications ${whereClause}`
      const countResult = await pool.query(countQuery, queryParams)
      const total = Number.parseInt(countResult.rows[0].count)

      // Get notifications
      const offset = (page - 1) * limit
      const dataQuery = `
        SELECT * FROM notifications 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `

      queryParams.push(limit, offset)
      const result = await pool.query(dataQuery, queryParams)

      return {
        notifications: result.rows.map((notification) => ({
          ...notification,
          metadata: JSON.parse(notification.metadata || "{}"),
        })),
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error("Error fetching user notifications", error)
      throw error
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `

      const result = await pool.query(query, [notificationId, userId])

      if (result.rows.length === 0) {
        throw new Error("Notification not found or access denied")
      }

      // Emit real-time update
      this.emitToUser(userId, "notification_read", { notificationId })

      return result.rows[0]
    } catch (error) {
      logger.error("Error marking notification as read", error)
      throw error
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE user_id = $1 AND is_read = false
        RETURNING COUNT(*) as updated_count
      `

      const result = await pool.query(query, [userId])

      // Emit real-time update
      this.emitToUser(userId, "all_notifications_read", {})

      return { updatedCount: result.rows[0]?.updated_count || 0 }
    } catch (error) {
      logger.error("Error marking all notifications as read", error)
      throw error
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const query = `
        DELETE FROM notifications 
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `

      const result = await pool.query(query, [notificationId, userId])

      if (result.rows.length === 0) {
        throw new Error("Notification not found or access denied")
      }

      // Emit real-time update
      this.emitToUser(userId, "notification_deleted", { notificationId })

      return true
    } catch (error) {
      logger.error("Error deleting notification", error)
      throw error
    }
  }

  // Get notification counts
  async getNotificationCounts(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_read = false) as unread,
          COUNT(*) FILTER (WHERE priority = 'HIGH') as high_priority,
          COUNT(*) FILTER (WHERE priority = 'URGENT') as urgent
        FROM notifications 
        WHERE user_id = $1
      `

      const result = await pool.query(query, [userId])
      return result.rows[0]
    } catch (error) {
      logger.error("Error fetching notification counts", error)
      throw error
    }
  }

  // WebSocket connection management
  addConnection(userId, ws) {
    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, new Set())
    }
    this.activeConnections.get(userId).add(ws)

    ws.on("close", () => {
      this.removeConnection(userId, ws)
    })

    logger.info("WebSocket connection added", { userId })
  }

  removeConnection(userId, ws) {
    if (this.activeConnections.has(userId)) {
      this.activeConnections.get(userId).delete(ws)
      if (this.activeConnections.get(userId).size === 0) {
        this.activeConnections.delete(userId)
      }
    }
    logger.info("WebSocket connection removed", { userId })
  }

  // Emit real-time notification to user
  emitToUser(userId, event, data) {
    if (this.activeConnections.has(userId)) {
      const connections = this.activeConnections.get(userId)
      const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() })

      connections.forEach((ws) => {
        if (ws.readyState === 1) {
          // WebSocket.OPEN
          try {
            ws.send(message)
          } catch (error) {
            logger.error("Error sending WebSocket message", error)
            this.removeConnection(userId, ws)
          }
        }
      })
    }
  }

  // Send email notification (placeholder - integrate with your email service)
  async sendEmailNotification(userId, notification) {
    try {
      // Get user email
      const userQuery = "SELECT email, full_name FROM users WHERE id = $1"
      const userResult = await pool.query(userQuery, [userId])

      if (userResult.rows.length === 0) {
        throw new Error("User not found")
      }

      const user = userResult.rows[0]

      // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
      logger.info("Email notification would be sent", {
        to: user.email,
        subject: notification.title,
        message: notification.message,
        priority: notification.priority,
      })

      // Example integration:
      // await emailService.send({
      //   to: user.email,
      //   subject: notification.title,
      //   html: this.generateEmailTemplate(notification, user),
      //   priority: notification.priority
      // });
    } catch (error) {
      logger.error("Error sending email notification", error)
      // Don't throw error - email failure shouldn't break notification creation
    }
  }

  // Generate email template
  generateEmailTemplate(notification, user) {
    return `
      <html>
        <body>
          <h2>FIU System Notification</h2>
          <p>Dear ${user.full_name},</p>
          <h3>${notification.title}</h3>
          <p>${notification.message}</p>
          <p>Priority: ${notification.priority}</p>
          <p>Time: ${new Date(notification.created_at).toLocaleString()}</p>
          <hr>
          <p>This is an automated message from the Financial Intelligence Unit System.</p>
        </body>
      </html>
    `
  }

  // Bulk notifications
  async createBulkNotifications(notifications) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const results = []

      for (const notificationData of notifications) {
        const { userId, type, title, message, metadata = {}, priority = "NORMAL" } = notificationData

        const query = `
          INSERT INTO notifications (
            user_id, type, title, message, metadata, priority, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          RETURNING *
        `

        const result = await client.query(query, [userId, type, title, message, JSON.stringify(metadata), priority])

        const notification = result.rows[0]
        results.push(notification)

        // Emit real-time notification
        this.emitToUser(userId, "new_notification", notification)
      }

      await client.query("COMMIT")
      logger.info("Bulk notifications created", { count: results.length })
      return results
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Error creating bulk notifications", error)
      throw error
    } finally {
      client.release()
    }
  }

  // System-wide notifications
  async createSystemNotification(notificationData, targetRoles = []) {
    try {
      let userQuery = "SELECT id FROM users WHERE is_active = true"
      const queryParams = []

      if (targetRoles.length > 0) {
        userQuery += ` AND role = ANY($1)`
        queryParams.push(targetRoles)
      }

      const usersResult = await pool.query(userQuery, queryParams)
      const userIds = usersResult.rows.map((row) => row.id)

      const notifications = userIds.map((userId) => ({
        ...notificationData,
        userId,
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      logger.error("Error creating system notification", error)
      throw error
    }
  }
}

module.exports = new NotificationService()
