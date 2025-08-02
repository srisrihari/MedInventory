#!/bin/bash

# 🚀 MedInventory Deployment Script
# This script helps prepare your app for deployment

echo "🚀 MedInventory Deployment Preparation"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check if backend is running locally
echo "🔍 Checking local backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Local backend is running"
else
    echo "⚠️  Local backend is not running. Please start it first:"
    echo "   cd backend && python start_server.py"
    echo ""
fi

# Check if frontend is running locally
echo "🔍 Checking local frontend..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Local frontend is running"
else
    echo "⚠️  Local frontend is not running. Please start it first:"
    echo "   npm run dev"
    echo ""
fi

# Check environment variables
echo "🔍 Checking environment variables..."

# Check if .env file exists in backend
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env file exists"
else
    echo "⚠️  Backend .env file not found. You'll need to set environment variables in Render."
fi

# Check required environment variables
required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "TOGETHER_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "✅ All required environment variables are set"
else
    echo "⚠️  Missing environment variables: ${missing_vars[*]}"
    echo "   These will need to be set in Render dashboard"
fi

echo ""
echo "📋 DEPLOYMENT CHECKLIST"
echo "======================="
echo ""
echo "🔧 BACKEND (Render):"
echo "   [ ] Create Render account at https://render.com"
echo "   [ ] Connect GitHub repository"
echo "   [ ] Create new Web Service"
echo "   [ ] Set environment variables:"
echo "       - APP_ENV=production"
echo "       - SECRET_KEY=your-secret-key"
echo "       - SUPABASE_URL=your-supabase-url"
echo "       - SUPABASE_ANON_KEY=your-anon-key"
echo "       - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo "       - TOGETHER_API_KEY=your-together-ai-key"
echo "   [ ] Deploy and note the URL"
echo ""
echo "🎨 FRONTEND (Vercel):"
echo "   [ ] Create Vercel account at https://vercel.com"
echo "   [ ] Import GitHub repository"
echo "   [ ] Set environment variable:"
echo "       - VITE_API_URL=https://your-render-url.onrender.com"
echo "   [ ] Deploy and note the URL"
echo ""
echo "🧪 TESTING:"
echo "   [ ] Test backend health: curl https://your-render-url.onrender.com/health"
echo "   [ ] Test frontend: Visit your Vercel URL"
echo "   [ ] Test login functionality"
echo "   [ ] Test all major features"
echo ""
echo "📚 RESOURCES:"
echo "   - Full deployment guide: DEPLOYMENT_GUIDE.md"
echo "   - Render docs: https://render.com/docs"
echo "   - Vercel docs: https://vercel.com/docs"
echo ""
echo "🎉 Ready to deploy! Follow the checklist above."
echo ""
echo "💡 TIP: Start with backend deployment first, then frontend." 