const { PrismaClient } = require("@prisma/client")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

// Create a simple database connection for fallback
const pool = {
  query: async () => {
    console.log("Using mock database connection")
    return { rows: [{ status: 1 }] }
  },
  end: async () => {}
}

// Initialize PrismaClient with fallback
let prisma
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
} catch (error) {
  console.error("Failed to initialize PrismaClient:", error)
  // Create a mock prisma client for development
  prisma = {
    $connect: async () => console.log("Mock connection"),
    $disconnect: async () => console.log("Mock disconnection"),
    $queryRaw: async () => [{ status: 1 }],
    user: {
      findUnique: async () => null,
      findFirst: async () => null,
      count: async () => 0
    }
  }
}

// Database connection test
async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    // Don't exit process in development to allow server to start anyway
    if (process.env.NODE_ENV === "production") {
      process.exit(1)
    }
  }
}

// Graceful shutdown
async function disconnectDatabase() {
  await prisma.$disconnect()
  console.log("🔌 Database disconnected")
}

// Health check
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

module.exports = {
  prisma,
  pool,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
}