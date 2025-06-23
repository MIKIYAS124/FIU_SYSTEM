#!/bin/bash

echo "🚀 Setting up FIU System for Local Development"
echo "=============================================="

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 6000; then
    echo "❌ PostgreSQL is not running on port 6000. Checking default port 5432..."
    if ! pg_isready -h localhost -p 5432; then
        echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
        echo "   On Windows: Start PostgreSQL service from Services"
        echo "   Or use: net start postgresql-x64-14"
        exit 1
    else
        echo "✅ PostgreSQL found on port 5432"
        DB_PORT=5432
    fi
else
    echo "✅ PostgreSQL found on port 6000"
    DB_PORT=6000
fi

# Create database
echo "📊 Creating database..."
psql -h localhost -p $DB_PORT -U postgres -c "DROP DATABASE IF EXISTS fiu_system;" 2>/dev/null
psql -h localhost -p $DB_PORT -U postgres -c "CREATE DATABASE fiu_system;"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create database. Trying with different user..."
    psql -h localhost -p $DB_PORT -U $USER -c "CREATE DATABASE fiu_system;" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "❌ Database creation failed. Please check PostgreSQL setup."
        echo "Try running: createdb fiu_system"
        exit 1
    fi
fi

# Create tables and insert data
echo "📋 Creating tables and inserting sample data..."
psql -h localhost -p $DB_PORT -U postgres -d fiu_system -f database.sql

if [ $? -ne 0 ]; then
    echo "❌ Failed to create tables. Trying with different user..."
    psql -h localhost -p $DB_PORT -U $USER -d fiu_system -f database.sql
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create tables. Please check database.sql file."
        exit 1
    fi
fi

# Check if package.json exists, if not create it
if [ ! -f "package.json" ]; then
    echo "📦 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "fiu-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-radio-group": "^1.1.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/node": "^20.9.0",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5"
  }
}
EOF
fi

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies."
    echo "Try running: npm install --force"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "📁 Creating backend directory..."
    mkdir -p backend/src/{controllers,routes,middleware,services,utils,config}
fi

# Create backend package.json if it doesn't exist
if [ ! -f "backend/package.json" ]; then
    echo "📦 Creating backend package.json..."
    cat > backend/package.json << 'EOF'
{
  "name": "fiu-backend",
  "version": "1.0.0",
  "description": "FIU System Backend API",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "express-validator": "^7.0.1",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies."
    exit 1
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "1. Backend:  cd backend && npm run dev"
echo "2. Frontend: npm run dev (in a new terminal)"
echo ""
echo "🔑 Login credentials:"
echo "- Super Admin: superadmin / password"
echo "- Admin: admin / password" 
echo "- Encoder: encoder / password"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:5000"
echo ""
echo "🎉 Your FIU System is ready to use!"
