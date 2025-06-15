# FIU Backend - Local Development Setup Guide

## 🚀 Complete Local Setup for VS Code + pgAdmin + Node.js

This guide will help you set up the FIU Backend system on your local machine using VS Code, pgAdmin, and Node.js.

## Prerequisites Checklist

Before starting, ensure you have these installed:

- ✅ **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- ✅ **PostgreSQL** (v13 or higher) - [Download here](https://www.postgresql.org/download/)
- ✅ **pgAdmin** (v4 or higher) - [Download here](https://www.pgadmin.org/download/)
- ✅ **VS Code** - [Download here](https://code.visualstudio.com/)
- ✅ **Git** - [Download here](https://git-scm.com/)

## Step 1: Verify Your Installation

Open your terminal/command prompt and run these commands:

\`\`\`bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check PostgreSQL version
psql --version

# Check if PostgreSQL service is running (Windows)
sc query postgresql-x64-13

# Check if PostgreSQL service is running (macOS)
brew services list | grep postgresql

# Check if PostgreSQL service is running (Linux)
sudo systemctl status postgresql
\`\`\`

## Step 2: Clone and Setup Project

\`\`\`bash
# Clone the project (replace with your actual repository URL)
git clone <your-repository-url>
cd fiu-backend

# Install all dependencies
npm install

# Create uploads directory
mkdir uploads
mkdir logs
\`\`\`

## Step 3: Database Setup with pgAdmin

### 3.1 Open pgAdmin and Connect to PostgreSQL

1. **Open pgAdmin** from your applications
2. **Create a new server connection:**
   - Right-click "Servers" → "Create" → "Server"
   - **General Tab:**
     - Name: `FIU Local Database`
   - **Connection Tab:**
     - Host: `localhost`
     - Port: `6000` (default PostgreSQL port)
     - Username: `postgres` (or your PostgreSQL username)
     - Password: `your_postgres_password`

### 3.2 Create the FIU Database

1. **Right-click on your server** → "Create" → "Database"
2. **Database name:** `fiu_system`
3. **Owner:** `postgres` (or your username)
4. **Click "Save"**

### 3.3 Run Database Scripts

1. **Open Query Tool:**
   - Right-click on `fiu_system` database → "Query Tool"

2. **Run scripts in this exact order:**

\`\`\`sql
-- Copy and paste each script content from the scripts folder and run them one by one

-- 1. First, run this to create the database (if not already created)
-- scripts/01-create-database.sql

-- 2. Create users table
-- Copy content from scripts/02-create-users-table.sql and run

-- 3. Create reporting entities table  
-- Copy content from scripts/03-create-reporting-entities-table.sql and run

-- 4. Continue with all scripts in order...
-- scripts/04-create-transaction-manner-table.sql
-- scripts/05-create-crime-types-table.sql
-- scripts/06-create-branches-table.sql
-- scripts/07-create-str-reports-table.sql
-- scripts/08-create-ctr-reports-table.sql
-- scripts/09-create-report-attachments-table.sql
-- scripts/10-create-audit-logs-table.sql
-- scripts/11-create-system-settings-table.sql
-- scripts/12-create-user-sessions-table.sql
-- scripts/13-create-notifications-table.sql
-- scripts/14-insert-initial-data.sql
-- scripts/15-create-views.sql
-- scripts/16-create-functions.sql
-- scripts/17-create-triggers.sql
-- scripts/18-create-indexes-performance.sql
-- scripts/19-grant-permissions.sql
-- scripts/20-create-sample-data.sql
-- scripts/21-create-workflow-history-table.sql
\`\`\`

**💡 Pro Tip:** Run each script individually and check for any errors before proceeding to the next one.

## Step 4: Environment Configuration

### 4.1 Create Environment File

\`\`\`bash
# Copy the example environment file
cp .env.example .env
\`\`\`

### 4.2 Edit .env File

Open `.env` in VS Code and update with your local settings:

\`\`\`env
# Database Configuration
DATABASE_URL="postgresql://postgres:12345678@localhost:6000/fiu_system"
DB_POOL_MAX=20
DB_POOL_MIN=5

# JWT Configuration (Generate strong secrets)
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-refresh-secret-key-different-from-jwt-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_TIMEOUT_HOURS=24
PASSWORD_RESET_EXPIRES_HOURS=1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"
ALLOWED_FILE_TYPES="pdf,doc,docx,xls,xlsx,jpg,jpeg,png"

# Email Configuration (Optional - for testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="FIU System <noreply@fiu.gov.et>"
\`\`\`

**🔐 Important:** Replace `12345678` with your actual PostgreSQL password and generate strong JWT secrets.

## Step 5: VS Code Setup

### 5.1 Install Recommended Extensions

Open VS Code and install these extensions:

1. **JavaScript (ES6) code snippets**
2. **Node.js Extension Pack**
3. **PostgreSQL** (by Chris Kolkman)
4. **REST Client** (for API testing)
5. **GitLens** (for Git integration)
6. **Prettier** (for code formatting)
7. **ESLint** (for code linting)

### 5.2 VS Code Settings

Create `.vscode/settings.json` in your project root:

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/logs": true,
    "**/uploads": true
  }
}
\`\`\`

### 5.3 Create Launch Configuration

Create `.vscode/launch.json` for debugging:

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch FIU Backend",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/src/app.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "node",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
\`\`\`

## Step 6: Test Database Connection

### 6.1 Create a Test Script

Create `test-db.js` in your project root:

\`\`\`javascript
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function testConnection() {
  try {
    console.log('Testing database connection...')
    const client = await pool.connect()
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time')
    console.log('✅ Database connected successfully!')
    console.log('Current time:', result.rows[0].current_time)
    
    // Test if tables exist
    const tables = await client.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    \`)
    
    console.log('📋 Available tables:')
    tables.rows.forEach(row => {
      console.log('  -', row.table_name)
    })
    
    client.release()
    await pool.end()
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()
\`\`\`

### 6.2 Run the Test

\`\`\`bash
node test-db.js
\`\`\`

You should see output like:
\`\`\`
Testing database connection...
✅ Database connected successfully!
Current time: 2024-01-15T10:30:45.123Z
📋 Available tables:
  - audit_logs
  - branches
  - crime_types
  - ctr_reports
  - notifications
  - reporting_entities
  - str_reports
  - transaction_manners
  - users
  - workflow_history
\`\`\`

## Step 7: Start the Development Server

### 7.1 Start the Server

\`\`\`bash
# Start in development mode with auto-restart
npm run dev

# Or start normally
npm start
\`\`\`

### 7.2 Verify Server is Running

You should see output like:
\`\`\`
✅ Database connected successfully
🚀 Server running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/health
🔐 Auth endpoints: http://localhost:5000/api/auth
🔔 WebSocket server: ws://localhost:5000/ws
\`\`\`

### 7.3 Test the Health Endpoint

Open your browser and go to: `http://localhost:5000/health`

You should see:
\`\`\`json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "uptime": 123.456,
    "environment": "development",
    "database": "connected",
    "websocket": 0
  }
}
\`\`\`

## Step 8: Test API Endpoints

### 8.1 Create API Test File

Create `test-api.http` in VS Code (requires REST Client extension):

\`\`\`http
### Health Check
GET http://localhost:5000/health

### Login as Super Admin
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "admin123"
}

### Get Current User (replace TOKEN with actual token from login)
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE

### Get Super Admin Dashboard
GET http://localhost:5000/api/super-admin/dashboard
Authorization: Bearer YOUR_TOKEN_HERE

### Create Reporting Entity
POST http://localhost:5000/api/super-admin/reporting-entities
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "entityName": "Test Bank",
  "taxId": "TIN123456789",
  "businessType": "Commercial Bank",
  "issuingCountry": "Ethiopia",
  "registrationNumber": "REG123456789",
  "countryOfOrigin": "Ethiopia",
  "country": "Ethiopia",
  "address": "123 Main Street",
  "city": "Addis Ababa",
  "region": "Addis Ababa",
  "contactPerson": "John Doe",
  "contactEmail": "john@testbank.com",
  "contactPhone": "+251911123456"
}
\`\`\`

### 8.2 Test the Endpoints

1. Click on "Send Request" above each HTTP request in VS Code
2. Verify you get proper responses
3. Copy the JWT token from the login response and use it in subsequent requests

## Step 9: Common Troubleshooting

### 9.1 Database Connection Issues

**Problem:** `ECONNREFUSED` or connection timeout

**Solutions:**
\`\`\`bash
# Check if PostgreSQL is running
# Windows:
sc query postgresql-x64-13

# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check if port 6000 is open
netstat -an | grep 6000
\`\`\`

### 9.2 Permission Issues

**Problem:** `permission denied for database` or `role does not exist`

**Solutions:**
\`\`\`sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create user if doesn't exist
CREATE USER your_username WITH PASSWORD '12345678';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fiu_system TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
\`\`\`

### 9.3 Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
\`\`\`bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process (replace PID with actual process ID)
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>

# Or change port in .env file
PORT=5001
\`\`\`

### 9.4 Module Not Found Errors

**Problem:** `Cannot find module` errors

**Solutions:**
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Or use npm ci for clean install
npm ci
\`\`\`

### 9.5 JWT Secret Issues

**Problem:** `JWT secret not provided` or token errors

**Solutions:**
\`\`\`bash
# Generate strong JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env file with generated secrets
JWT_SECRET="generated_secret_here"
JWT_REFRESH_SECRET="another_generated_secret_here"
\`\`\`

## Step 10: Development Workflow

### 10.1 Recommended VS Code Workflow

1. **Start the server:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Open multiple terminals in VS Code:**
   - Terminal 1: Server running
   - Terminal 2: Database queries/testing
   - Terminal 3: Git commands

3. **Use VS Code debugger:**
   - Set breakpoints in your code
   - Press F5 to start debugging
   - Use the Debug Console for testing

### 10.2 Database Management with pgAdmin

1. **View data:**
   - Right-click table → "View/Edit Data" → "All Rows"

2. **Run queries:**
   - Right-click database → "Query Tool"

3. **Monitor performance:**
   - Tools → "Server Status"

4. **Backup database:**
   - Right-click database → "Backup"

### 10.3 API Testing Workflow

1. **Use REST Client extension** in VS Code for quick API testing
2. **Use Postman** for more complex API testing scenarios
3. **Check server logs** in VS Code terminal for debugging
4. **Monitor database changes** in pgAdmin

## Step 11: Production Preparation

### 11.1 Environment Variables for Production

\`\`\`env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
# ... other production settings
\`\`\`

### 11.2 Build for Production

\`\`\`bash
# Install production dependencies only
npm ci --only=production

# Start in production mode
npm start
\`\`\`

## 🎉 You're All Set!

Your FIU Backend system should now be running locally. You can:

- ✅ **Access the API** at `http://localhost:5000`
- ✅ **View database** in pgAdmin
- ✅ **Debug code** in VS Code
- ✅ **Test endpoints** with REST Client
- ✅ **Monitor logs** in VS Code terminal

## 📞 Need Help?

If you encounter any issues:

1. **Check the logs** in VS Code terminal
2. **Verify database connection** in pgAdmin
3. **Test individual endpoints** with REST Client
4. **Check environment variables** in `.env` file
5. **Restart the server** if needed

Happy coding! 🚀
