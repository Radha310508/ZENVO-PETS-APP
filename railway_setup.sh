#!/bin/bash

# ZENVO PETS - Quick Railway Deployment Script
# This script helps you prepare environment variables for Railway

echo "🐾 ZENVO PETS - Railway Deployment Helper"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you prepare environment variables for Railway.${NC}"
echo ""

# Backend Environment Variables
echo -e "${GREEN}=== BACKEND ENVIRONMENT VARIABLES ===${NC}"
echo ""

# MongoDB URL
echo -e "${YELLOW}1. MongoDB Connection String${NC}"
echo "   Go to MongoDB Atlas → Clusters → Connect → Connect your application"
echo "   Format: mongodb+srv://username:password@cluster.mongodb.net/zenvo_pets"
echo ""
read -p "   Enter your MongoDB URL: " MONGO_URL
echo ""

# JWT Secret
echo -e "${YELLOW}2. JWT Secret (for authentication)${NC}"
echo "   Generating a secure random secret..."
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "your-super-secret-jwt-key-$(date +%s)")
echo "   Generated: $JWT_SECRET"
echo ""

# CORS Origins
echo -e "${YELLOW}3. CORS Origins${NC}"
echo "   For initial deployment, use: *"
echo "   After frontend is deployed, update to: https://your-frontend.railway.app"
CORS_ORIGINS="*"
echo "   Using: $CORS_ORIGINS"
echo ""

# Emergent LLM Key
echo -e "${YELLOW}4. Emergent LLM Key (for AI insights)${NC}"
EMERGENT_LLM_KEY="sk-emergent-e56B79b65D9FaB6Eb8"
echo "   Using: $EMERGENT_LLM_KEY"
echo ""

# Frontend Environment Variables
echo -e "${GREEN}=== FRONTEND ENVIRONMENT VARIABLES ===${NC}"
echo ""

echo -e "${YELLOW}5. Backend URL${NC}"
echo "   After deploying backend, Railway will give you a URL"
echo "   Format: https://your-app-name.railway.app"
echo ""
read -p "   Enter your backend URL (or press Enter to skip for now): " REACT_APP_BACKEND_URL

if [ -z "$REACT_APP_BACKEND_URL" ]; then
    REACT_APP_BACKEND_URL="https://your-backend.railway.app"
    echo "   ⚠️  Using placeholder. Update this after backend deployment!"
fi
echo ""

# Generate summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   📋 COPY THESE TO RAILWAY${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}🔧 BACKEND SERVICE - Environment Variables:${NC}"
echo ""
echo "MONGO_URL=$MONGO_URL"
echo "DB_NAME=zenvo_pets"
echo "JWT_SECRET=$JWT_SECRET"
echo "CORS_ORIGINS=$CORS_ORIGINS"
echo "EMERGENT_LLM_KEY=$EMERGENT_LLM_KEY"
echo "PYTHONUNBUFFERED=1"
echo ""

echo -e "${BLUE}🎨 FRONTEND SERVICE - Environment Variables:${NC}"
echo ""
echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL"
echo "NODE_ENV=production"
echo ""

echo -e "${GREEN}========================================${NC}"
echo ""

# Save to file
cat > /tmp/railway_env.txt << EOF
=== BACKEND ENVIRONMENT VARIABLES ===
MONGO_URL=$MONGO_URL
DB_NAME=zenvo_pets
JWT_SECRET=$JWT_SECRET
CORS_ORIGINS=$CORS_ORIGINS
EMERGENT_LLM_KEY=$EMERGENT_LLM_KEY
PYTHONUNBUFFERED=1

=== FRONTEND ENVIRONMENT VARIABLES ===
REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
NODE_ENV=production

=== BACKEND BUILD SETTINGS ===
Root Directory: /backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn server:app --host 0.0.0.0 --port \$PORT

=== FRONTEND BUILD SETTINGS ===
Root Directory: /frontend
Build Command: yarn install && yarn build
Start Command: npx serve -s build -p \$PORT
EOF

echo -e "${GREEN}✅ Saved to: /tmp/railway_env.txt${NC}"
echo ""

# Next steps
echo -e "${BLUE}📝 NEXT STEPS:${NC}"
echo ""
echo "1. Go to https://railway.app and create a new project"
echo "2. Connect your GitHub repository"
echo "3. Add a new service for BACKEND:"
echo "   - Set root directory: /backend"
echo "   - Copy-paste the backend environment variables above"
echo "   - Deploy!"
echo ""
echo "4. Copy the backend URL Railway gives you"
echo ""
echo "5. Add a new service for FRONTEND:"
echo "   - Set root directory: /frontend"
echo "   - Update REACT_APP_BACKEND_URL with your backend URL"
echo "   - Copy-paste the frontend environment variables"
echo "   - Deploy!"
echo ""
echo "6. Update backend CORS_ORIGINS with your frontend URL"
echo ""
echo "7. Test your app! 🎉"
echo ""
echo -e "${YELLOW}📖 For detailed instructions, see: RAILWAY_DEPLOYMENT.md${NC}"
echo ""
