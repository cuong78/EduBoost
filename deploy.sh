#!/bin/bash

# EduBoost Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh prod

set -e

ENVIRONMENT=${1:-dev}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "🚀 Starting deployment for environment: $ENVIRONMENT"
echo "📦 Using compose file: $COMPOSE_FILE"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file from .env.example"
    exit 1
fi

# Pull latest code (if git repo)
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || git pull origin master || echo "⚠️  Git pull failed, continuing..."
fi

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f $COMPOSE_FILE pull || echo "⚠️  Some images not found in registry, will build locally"

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f $COMPOSE_FILE up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service status:"
docker-compose -f $COMPOSE_FILE ps

# Health checks
echo "🏥 Running health checks..."

# Backend health check
if docker-compose -f $COMPOSE_FILE exec -T backend wget --spider -q http://localhost:8080/actuator/health 2>/dev/null; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed"
fi

# Frontend health check
if docker-compose -f $COMPOSE_FILE exec -T frontend wget --spider -q http://localhost/ 2>/dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend health check failed"
fi

# Clean up
echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

echo "✅ Deployment completed!"
echo "📝 View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "🛑 Stop services: docker-compose -f $COMPOSE_FILE down"
