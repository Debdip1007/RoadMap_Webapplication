#!/bin/bash

# Production deployment script
set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test:run

# Build the application
echo "🏗️ Building application..."
npm run build

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level moderate

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t goal-tracker:latest .

# Tag for production
docker tag goal-tracker:latest goal-tracker:production

echo "✅ Deployment build completed successfully!"
echo "📋 Next steps:"
echo "   1. Push image to registry: docker push goal-tracker:production"
echo "   2. Deploy to your hosting platform"
echo "   3. Update environment variables"
echo "   4. Run database migrations if needed"