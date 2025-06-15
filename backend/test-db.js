const { prisma } = require("./src/utils/database")

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Test if tables exist by querying the users table
    const userCount = await prisma.user.count()
    console.log(`📋 User count: ${userCount}`)
    
    // Close connection
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

testConnection()