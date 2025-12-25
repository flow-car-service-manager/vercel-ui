#!/bin/bash

# Flow Car Service Manager - Build and Test Script
# This script builds the application and runs basic tests

set -e  # Exit on error

echo "🚀 Starting Flow Car Service Manager build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js version
print_message "Checking Node.js version..."
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION != v2[0-9]* ]] && [[ $NODE_VERSION != v18* ]]; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: Node.js 18 or 20."
fi

# Install dependencies
print_message "Installing dependencies..."
npm ci --silent

# Run linting
print_message "Running ESLint..."
npm run lint || {
    print_warning "ESLint found issues. Continuing anyway..."
}

# Run build
print_message "Building application..."
npm run build

# Check build output
if [ -d ".next" ]; then
    print_message "Build completed successfully!"
    
    # Check if standalone output was created
    if [ -d ".next/standalone" ]; then
        print_message "Standalone build detected (ready for Docker deployment)"
    fi
else
    print_error "Build failed! .next directory not found."
    exit 1
fi

# Run tests if available
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    print_message "Running tests..."
    npm test -- --passWithNoTests || {
        print_warning "Tests failed or no tests found."
    }
fi

# Check for security vulnerabilities
print_message "Checking for security vulnerabilities..."
npm audit --audit-level=high || {
    print_warning "Security vulnerabilities found. Run 'npm audit fix' to fix them."
}

# Create production-ready package
print_message "Creating production package..."
rm -rf dist 2>/dev/null || true
mkdir -p dist

# Copy necessary files
cp -r .next dist/
cp -r public dist/ 2>/dev/null || true
cp package.json dist/
cp package-lock.json dist/ 2>/dev/null || true
cp next.config.js dist/ 2>/dev/null || true

# Create .env.production template
cat > dist/.env.production.example << EOF
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NODE_ENV=production
PORT=3000
EOF

print_message "✅ Build process completed!"
print_message ""
print_message "📦 Production files are in the 'dist' directory"
print_message "🐳 For Docker deployment: docker build -t flow-car-service-frontend ."
print_message "🚢 For Vercel deployment: Push to GitHub and connect to Vercel"
print_message ""
print_message "To start the production server:"
print_message "  cd dist && npm start"
print_message ""
print_message "Health check endpoint: http://localhost:3000/api/health"