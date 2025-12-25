#!/bin/bash

# Docker Test Script for Flow Car Service Manager
# Tests Docker build and run functionality

set -e

echo "🐳 Testing Docker build and run..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Clean up any existing containers
print_info "Cleaning up existing containers..."
docker stop flow-car-test 2>/dev/null || true
docker rm flow-car-test 2>/dev/null || true

# Build the Docker image
print_info "Building Docker image..."
docker build -t flow-car-service-test .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully!"
else
    print_error "Docker build failed!"
    exit 1
fi

# Run the container
print_info "Starting Docker container..."
docker run -d \
  --name flow-car-test \
  -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080/api \
  -e NODE_ENV=production \
  flow-car-service-test

# Wait for container to start
print_info "Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q flow-car-test; then
    print_success "Container is running!"
else
    print_error "Container failed to start!"
    docker logs flow-car-test
    exit 1
fi

# Test health endpoint
print_info "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health/ || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_success "Health check passed! (HTTP $HEALTH_RESPONSE)"
    
    # Get health details
    echo ""
    print_info "Health check details:"
    curl -s http://localhost:3001/api/health/ | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/api/health/
else
    print_error "Health check failed! (HTTP $HEALTH_RESPONSE)"
    docker logs flow-car-test
fi

# Test main page
print_info "Testing main page..."
MAIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ || echo "000")

if [ "$MAIN_RESPONSE" = "200" ]; then
    print_success "Main page loaded successfully! (HTTP $MAIN_RESPONSE)"
else
    print_error "Main page failed to load! (HTTP $MAIN_RESPONSE)"
fi

# Display container info
echo ""
print_info "Container Information:"
echo "=========================="
docker ps --filter "name=flow-car-test" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
print_info "Container Logs (last 10 lines):"
echo "===================================="
docker logs --tail 10 flow-car-test

# Cleanup
echo ""
print_info "Cleaning up test container..."
docker stop flow-car-test
docker rm flow-car-test

echo ""
if [ "$HEALTH_RESPONSE" = "200" ] && [ "$MAIN_RESPONSE" = "200" ]; then
    print_success "✅ All tests passed! Docker deployment is working correctly."
    echo ""
    print_info "To deploy to production:"
    print_info "1. Push to GitHub and connect to Vercel"
    print_info "2. Or deploy with: docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=your-api-url flow-car-service-test"
else
    print_error "❌ Some tests failed. Please check the logs above."
    exit 1
fi