const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const connectDB = async () => {
  try {
    await pool.query("SELECT NOW()")
    console.log("✅ Database connected successfully")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  }
}

module.exports = { pool, connectDB }
