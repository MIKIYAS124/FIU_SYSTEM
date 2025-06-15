const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
const path = require("path")
const { logger } = require("./utils/logger")
const { ResponseHelper } = require("./utils/response")
const { connectDatabase } = require("./utils/database")

const app = express()

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

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    ResponseHelper.success(res, "Server is healthy", {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    logger.error("Health check failed", error)
    ResponseHelper.serverError(res, "System is unhealthy", {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    })
  }
})

// API documentation endpoint
app.get("/api", (req, res) => {
  const apiInfo = {
    name: "FIU System API",
    version: "1.0.0",
    description: "Financial Intelligence Unit System API",
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

// Connect to database
connectDatabase()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  logger.info(`FIU System server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app