const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

// Database connection test
async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
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
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
}
