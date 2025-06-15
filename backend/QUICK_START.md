# FIU Backend - Quick Start Guide

## ⚡ 5-Minute Setup for Local Development

This is a condensed setup guide to get you running quickly.

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- pgAdmin
- VS Code

## Quick Setup Steps

### 1. Install Dependencies
\`\`\`bash
npm install
mkdir uploads logs
\`\`\`

### 2. Database Setup
1. Open **pgAdmin**
2. Create database: `fiu_system`
3. Run all SQL scripts in `scripts/` folder (01 through 21)

### 3. Environment Setup
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env`:
\`\`\`env
DATABASE_URL="postgresql://postgres:12345678@localhost:6000/fiu_system"
JWT_SECRET="your-32-character-secret-key-here"
JWT_REFRESH_SECRET="your-different-32-character-key"
PORT=5000
NODE_ENV="development"
\`\`\`

### 4. Start Server
\`\`\`bash
npm run dev
\`\`\`

### 5. Test
Visit: `http://localhost:5000/health`

## Default Login Credentials

After running the seed data script:

\`\`\`
Super Admin:
Username: superadmin
Password: admin123

Intermediate Admin:
Username: intermediateadmin  
Password: admin123

Data Encoder:
Username: dataencoder
Password: encoder123
\`\`\`

## Key Endpoints

\`\`\`
POST /api/auth/login          # Login
GET  /api/auth/me             # Current user
GET  /api/super-admin/dashboard    # Super admin dashboard
GET  /api/intermediate-admin/dashboard  # Intermediate admin dashboard
GET  /api/data-encoder/dashboard   # Data encoder dashboard
\`\`\`

## Test API with curl

\`\`\`bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "admin123"}'

# Use the returned token for authenticated requests
curl -X GET http://localhost:5000/api/super-admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

## Common Issues

**Database connection failed:**
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database `fiu_system` exists

**Port 5000 in use:**
- Change `PORT=5001` in `.env`
- Or kill process: `lsof -i :5000` then `kill -9 PID`

**JWT errors:**
- Generate new secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## VS Code Extensions

Install these for better development experience:
- REST Client (for API testing)
- PostgreSQL (for database queries)
- Node.js Extension Pack

## File Structure

\`\`\`
backend/
├── src/
│   ├── controllers/    # API route handlers
│   ├── services/       # Business logic
│   ├── routes/         # Route definitions
│   ├── middleware/     # Auth, validation, etc.
│   ├── utils/          # Helper functions
│   └── app.js          # Main application
├── scripts/            # Database setup scripts
├── uploads/            # File storage
└── logs/               # Application logs
\`\`\`

That's it! Your FIU Backend is now running locally. 🚀

For detailed troubleshooting, see `LOCAL_SETUP_GUIDE.md`.
