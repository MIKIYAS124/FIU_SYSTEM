const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
const morgan = require("morgan")
const path = require("path")
const http = require("http")
const WebSocket = require("ws")
const url = require("url")
const jwt = require("jsonwebtoken")

const { logger } = require("./utils/logger")
const { ResponseHelper } = require("./utils/response")
const { pool } = require("./utils/database")

// Import routes
const authRoutes = require("./routes/auth")
const superAdminRoutes = require("./routes/superAdmin")
const intermediateAdminRoutes = require("./routes/intermediateAdmin")
const dataEncoderRoutes = require("./routes/dataEncoder")
const workflowRoutes = require("./routes/workflow")
const notificationRoutes = require("./routes/notifications")
const commonRoutes = require("./routes/common")

// Import notification service for WebSocket
const notificationService = require("./services/notificationService")
const notificationController = require("./controllers/notificationController")

const app = express()

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1)

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

// Compression middleware
app.use(compression())

// Request logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
})

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await pool.query("SELECT 1")

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: "connected",
      version: process.env.npm_package_version || "1.0.0",
    }

    ResponseHelper.success(res, "System is healthy", healthStatus)
  } catch (error) {
    logger.error("Health check failed", error)
    ResponseHelper.serverError(res, "System is unhealthy", {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message,
    })
  }
})

// API routes
app.use("/api/auth", authLimiter, authRoutes)
app.use("/api/super-admin", superAdminRoutes)
app.use("/api/intermediate-admin", intermediateAdminRoutes)
app.use("/api/data-encoder", dataEncoderRoutes)
app.use("/api/workflow", workflowRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/common", commonRoutes)

// API documentation endpoint
app.get("/api", (req, res) => {
  const apiInfo = {
    name: "FIU System API",
    version: "1.0.0",
    description: "Financial Intelligence Unit System API",
    endpoints: {
      auth: "/api/auth",
      superAdmin: "/api/super-admin",
      intermediateAdmin: "/api/intermediate-admin",
      dataEncoder: "/api/data-encoder",
      workflow: "/api/workflow",
      notifications: "/api/notifications",
      common: "/api/common",
    },
    websocket: "/ws",
    documentation: "See README.md for detailed API documentation",
  }

  ResponseHelper.success(res, "FIU System API", apiInfo)
})

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  ResponseHelper.notFound(res, `API endpoint ${req.originalUrl} not found`)
})

// Global error handler
app.use((error, req, res, next) => {
  logger.error("Unhandled error", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development"

  ResponseHelper.serverError(
    res,
    "An unexpected error occurred",
    isDevelopment ? { error: error.message, stack: error.stack } : undefined,
  )
})

// Create HTTP server
const server = http.createServer(app)

// WebSocket server setup
const wss = new WebSocket.Server({
  server,
  path: "/ws",
  verifyClient: (info) => {
    try {
      const query = url.parse(info.req.url, true).query
      const token = query.token

      if (!token) {
        return false
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      info.req.user = decoded
      return true
    } catch (error) {
      logger.error("WebSocket authentication failed", error)
      return false
    }
  },
})

wss.on("connection", (ws, req) => {
  logger.info("WebSocket connection established", { userId: req.user?.id })
  notificationController.handleWebSocketConnection(ws, req)
})

wss.on("error", (error) => {
  logger.error("WebSocket server error", error)
})

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`)

  server.close(() => {
    logger.info("HTTP server closed")

    // Close WebSocket server
    wss.close(() => {
      logger.info("WebSocket server closed")

      // Close database connections
      pool.end(() => {
        logger.info("Database connections closed")
        process.exit(0)
      })
    })
  })

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down")
    process.exit(1)
  }, 30000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error)
  gracefulShutdown("uncaughtException")
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise })
  gracefulShutdown("unhandledRejection")
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  logger.info(`FIU System server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`)
  logger.info(`WebSocket server available at ws://localhost:${PORT}/ws`)
})

module.exports = app
