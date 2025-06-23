# FIU System Project Structure

## 📁 Directory Structure

\`\`\`
fiu-system/
├── 📁 frontend/                    # Next.js Frontend Application
│   ├── 📁 app/                     # Next.js App Router
│   │   ├── 📁 (auth)/             # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── 📁 dashboard/          # Main dashboard
│   │   ├── 📁 super-admin/        # Super admin pages
│   │   ├── 📁 intermediate-admin/ # Intermediate admin pages
│   │   ├── 📁 data-encoder/       # Data encoder pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── 📁 components/             # Reusable components
│   │   ├── 📁 ui/                 # shadcn/ui components
│   │   ├── 📁 layout/             # Layout components
│   │   └── 📁 forms/              # Form components
│   ├── 📁 lib/                    # Utility functions
│   ├── 📁 hooks/                  # Custom React hooks
│   ├── 📁 types/                  # TypeScript type definitions
│   └── 📁 public/                 # Static assets
├── 📁 backend/                    # Node.js Backend API
│   ├── 📁 src/                    # Source code
│   │   ├── 📁 config/             # Configuration files
│   │   ├── 📁 controllers/        # Route controllers
│   │   ├── 📁 middleware/         # Express middleware
│   │   ├── 📁 models/             # Database models
│   │   ├── 📁 routes/             # API routes
│   │   ├── 📁 services/           # Business logic
│   │   ├── 📁 utils/              # Utility functions
│   │   └── app.js                 # Main application file
│   ├── 📁 migrations/             # Database migrations
│   ├── 📁 seeds/                  # Database seed files
│   └── package.json
├── 📁 database/                   # Database related files
│   ├── 📁 migrations/             # SQL migration scripts
│   ├── 📁 seeds/                  # Initial data scripts
│   ├── 📁 backups/                # Database backups
│   └── 📁 scripts/                # Database utility scripts
├── 📁 docs/                       # Documentation
├── 📁 scripts/                    # Deployment scripts
└── 📁 config/                     # Environment configurations
\`\`\`

## 🎯 Key Features

### Frontend (Next.js 14)
- **App Router** with nested layouts
- **Role-based routing** and access control
- **shadcn/ui** components for consistent UI
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### Backend (Node.js + Express)
- **RESTful API** with proper HTTP methods
- **JWT authentication** with role-based access
- **PostgreSQL** database with connection pooling
- **Input validation** and error handling
- **Audit logging** for security

### Database (PostgreSQL)
- **Migration system** for version control
- **Seed data** for development and testing
- **Indexes** for performance optimization
- **Views** for complex queries
- **Backup/restore** scripts

## 🚀 Getting Started

1. **Clone and Setup**
   \`\`\`bash
   git clone <repository>
   cd fiu-system
   ./scripts/setup.sh
   \`\`\`

2. **Database Migration**
   \`\`\`bash
   ./scripts/migrate.sh
   \`\`\`

3. **Start Development**
   \`\`\`bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   \`\`\`

## 🔧 Environment Configuration

- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.test` - Testing settings
\`\`\`

```shellscript file="scripts/setup.sh"
#!/bin/bash

# FIU System Setup Script
# This script sets up the entire FIU system for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 FIU System Setup${NC}"
echo "===================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed. Please install PostgreSQL 12+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Create directory structure
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p {database/{migrations,seeds,backups,scripts},docs,config}

# Setup backend
echo -e "${YELLOW}📦 Setting up backend...${NC}"
cd backend
if [ ! -f package.json ]; then
    echo -e "${RED}❌ Backend package.json not found${NC}"
    exit 1
fi

npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Setup frontend
echo -e "${YELLOW}📦 Setting up frontend...${NC}"
cd ../
if [ ! -f package.json ]; then
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi

npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Copy environment files
echo -e "${YELLOW}⚙️ Setting up environment files...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}📝 Please update .env file with your database credentials${NC}"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}📝 Please update backend/.env file with your database credentials${NC}"
fi

# Make scripts executable
echo -e "${YELLOW}🔧 Making scripts executable...${NC}"
chmod +x scripts/*.sh
chmod +x database/scripts/*.sh

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env files with your database credentials"
echo "2. Run database migration: ./scripts/migrate.sh"
echo "3. Start development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: npm run dev"
