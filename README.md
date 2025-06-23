# FIU System - Local Development

Simple Financial Intelligence Unit system for local development.

## Quick Start

1. **Prerequisites:**
   - Node.js 18+
   - PostgreSQL 12+

2. **Setup:**
   \`\`\`bash
   chmod +x setup.sh
   ./setup.sh
   \`\`\`

3. **Start Development:**
   \`\`\`bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   npm run dev
   \`\`\`

4. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Login Credentials

- **Super Admin:** superadmin / password
- **Admin:** admin / password
- **Encoder:** encoder / password

## Features

- ✅ 3 User Roles (Super Admin, Intermediate Admin, Data Encoder)
- ✅ Suspicious Transaction Reporting
- ✅ User Management (Admin roles)
- ✅ Reporting Entity Management
- ✅ Branch Management
- ✅ Role-based Access Control

## Database

PostgreSQL database with 4 main tables:
- users
- reporting_entities  
- branches
- reports

All sample data included for testing.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with migration system
- **Authentication**: JWT with role-based access control

## 🎯 Features

### Role-Based Access Control
- **SUPER_ADMIN**: Full system access, manage all users and entities
- **INTERMEDIATE_ADMIN**: Manage branches and data encoders
- **DATA_ENCODER**: Create and manage reports

### Core Functionality
- ✅ User management with 3-tier role system
- ✅ Reporting entity management (Banks, Insurance, etc.)
- ✅ Branch management
- ✅ Suspicious transaction reporting
- ✅ Audit logging and security
- ✅ File upload and attachment support

## 📊 Database Schema

### Core Tables
- `users` - System users with role-based access
- `reporting_entities` - Financial institutions
- `branches` - Institution branches
- `reports` - Suspicious transaction reports
- `audit_logs` - System audit trail

### Default Users
- **Super Admin**: `superadmin` / `password`
- **Intermediate Admin**: `admin` / `password`
- **Data Encoder**: `encoder` / `password`

## 🛠️ Development

### Database Operations

\`\`\`bash
# Create migration files
./scripts/create-migrations.sh

# Run migrations
./scripts/migrate.sh

# Backup database
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh backup_file.sql.gz

# Rollback (WARNING: Destroys all data)
./scripts/rollback.sh
\`\`\`

### Project Structure
\`\`\`
fiu-system/
├── frontend/           # Next.js application
├── backend/           # Express.js API
├── database/          # Migration and seed files
├── scripts/           # Deployment scripts
└── docs/             # Documentation
\`\`\`

## 🔐 Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- SQL injection prevention
- Rate limiting
- Audit logging
- CORS protection

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Reports
- `GET /api/reports` - List reports (filtered by role)
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Branches
- `GET /api/branches` - List branches
- `POST /api/branches` - Create branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

## 🧪 Testing

\`\`\`bash
# Backend tests
cd backend && npm test

# Frontend tests
npm test
\`\`\`

## 📦 Deployment

### Production Setup

1. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env.production
   # Configure production settings
   \`\`\`

2. **Database Migration**
   \`\`\`bash
   NODE_ENV=production ./scripts/migrate.sh
   \`\`\`

3. **Build Applications**
   \`\`\`bash
   # Frontend
   npm run build
   
   # Backend
   cd backend && npm run build
   \`\`\`

4. **Start Production**
   \`\`\`bash
   NODE_ENV=production npm start
   \`\`\`

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)
- `PORT` - Application port

## 📞 Support

For issues and questions:
1. Check the documentation in `/docs`
2. Review the migration logs
3. Check application logs
4. Create an issue in the repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
