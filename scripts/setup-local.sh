#!/bin/bash

# =============================================================================
# Local Development Setup Script for FIU System
# =============================================================================

set -e

echo "🚀 Setting up FIU System for Local Development..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Copy environment file
if [ -f ".env.example" ]; then
    cp ".env.example" ".env"
    print_status "Created .env file from template"
else
    print_warning ".env.example not found, creating basic .env file"
    cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:12345678@localhost:6000/fiu_system"
JWT_SECRET=dev-jwt-secret-key-for-local-development
JWT_REFRESH_SECRET=dev-refresh-secret-key-for-local-development
FRONTEND_URL=http://localhost:3000
EOF
    print_status "Created basic .env file"
fi

# Create necessary directories
print_info "Creating local directories..."

directories=(
    "uploads"
    "logs"
    "temp"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    fi
done

# Set permissions
chmod 755 uploads logs temp 2>/dev/null || true

# Check if PostgreSQL is running
print_info "Checking PostgreSQL connection..."
if pg_isready -h localhost -p 6000 -U postgres >/dev/null 2>&1; then
    print_status "PostgreSQL is running and accessible"
else
    print_warning "PostgreSQL might not be running or accessible"
    echo "Please make sure PostgreSQL is running on localhost:6000"
    echo "You can start it with: brew services start postgresql (macOS) or sudo service postgresql start (Linux)"
fi

# Create database if it doesn't exist
print_info "Setting up database..."
if command -v psql >/dev/null 2>&1; then
    PGPASSWORD=12345678 psql -h localhost -p 6000 -U postgres -lqt | cut -d \| -f 1 | grep -qw fiu_system || {
        print_info "Creating fiu_system database..."
        PGPASSWORD=12345678 createdb -h localhost -p 6000 -U postgres fiu_system
        print_status "Database 'fiu_system' created"
    }
else
    print_warning "psql not found. Please create the database manually:"
    echo "CREATE DATABASE fiu_system;"
fi

# Display setup completion
echo ""
print_status "🎉 Local development setup complete!"
echo ""
print_info "Next steps:"
echo "1. Install dependencies: npm install"
echo "2. Run database migration: ./scripts/migrate.sh"
echo "3. Start backend server: npm run dev"
echo "4. Start frontend (in another terminal): npm run dev (in frontend directory)"
echo ""
print_info "Your local configuration:"
echo "• Database: postgresql://postgres:12345678@localhost:6000/fiu_system"
echo "• Backend: http://localhost:5000"
echo "• Frontend: http://localhost:3000"
echo "• WebSocket: ws://localhost:5001"
echo ""
print_warning "This setup is for LOCAL DEVELOPMENT ONLY!"
