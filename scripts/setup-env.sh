#!/bin/bash

# =============================================================================
# Environment Setup Script for FIU System
# =============================================================================

set -e

echo "🔧 Setting up FIU System Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if environment argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [development|production|test]"
    echo "Example: $0 development"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|production|test)$ ]]; then
    print_error "Invalid environment. Use: development, production, or test"
    exit 1
fi

print_info "Setting up $ENVIRONMENT environment..."

# Copy appropriate environment file
if [ -f ".env.$ENVIRONMENT" ]; then
    cp ".env.$ENVIRONMENT" ".env"
    print_status "Copied .env.$ENVIRONMENT to .env"
else
    print_error ".env.$ENVIRONMENT file not found!"
    exit 1
fi

# Generate JWT secrets for production
if [ "$ENVIRONMENT" = "production" ]; then
    print_info "Generating secure JWT secrets for production..."
    
    # Generate random JWT secrets
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    
    # Replace placeholders in .env file
    sed -i "s/CHANGE-THIS-TO-A-VERY-STRONG-SECRET-AT-LEAST-64-CHARACTERS-LONG/$JWT_SECRET/g" .env
    sed -i "s/CHANGE-THIS-TO-ANOTHER-VERY-STRONG-SECRET-AT-LEAST-64-CHARACTERS/$JWT_REFRESH_SECRET/g" .env
    
    print_status "Generated secure JWT secrets"
    print_warning "Please update database credentials and other production settings in .env"
fi

# Create necessary directories
print_info "Creating necessary directories..."

directories=(
    "uploads"
    "logs"
    "backups"
    "temp"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    fi
done

# Set proper permissions
chmod 755 uploads logs backups temp
print_status "Set directory permissions"

# Create .env.local for local overrides
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# =============================================================================
# LOCAL ENVIRONMENT OVERRIDES
# =============================================================================
# This file is for local development overrides
# Add any local-specific settings here
# This file should be in .gitignore

# Local Database Override (if needed)
# DATABASE_URL="postgresql://your_local_user:your_local_password@localhost:6000/fiu_system_local"

# Local Email Override (if needed)
# SMTP_HOST="localhost"
# SMTP_PORT=1025

# Local File Upload Override (if needed)
# UPLOAD_PATH="./local-uploads"
EOF
    print_status "Created .env.local for local overrides"
fi

# Validate required environment variables
print_info "Validating environment configuration..."

required_vars=(
    "DATABASE_URL"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "PORT"
    "NODE_ENV"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_status "Environment validation passed"

# Display next steps
echo ""
print_info "Environment setup complete! Next steps:"
echo "1. Review and update .env file with your specific values"
echo "2. Install dependencies: npm install"
echo "3. Run database migration: ./scripts/migrate.sh"
echo "4. Start the application: npm run dev"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    print_warning "PRODUCTION CHECKLIST:"
    echo "□ Update DATABASE_URL with production database"
    echo "□ Update FRONTEND_URL with production domain"
    echo "□ Configure SMTP settings for email"
    echo "□ Set up SSL certificates"
    echo "□ Configure monitoring and logging"
    echo "□ Set up backup strategy"
    echo "□ Review security settings"
fi

print_status "Environment setup completed successfully!"
