# 🚂 ZENVO PETS - Railway Deployment Guide

## Prerequisites
- Railway account (sign up at railway.app)
- GitHub account
- MongoDB Atlas account (for database)

---

## 📋 Step-by-Step Deployment

### **Phase 1: Setup MongoDB Atlas (5 minutes)**

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier
   - Create a new cluster (takes 3-5 minutes)

2. **Configure Database Access**
   - Go to "Database Access" → Add New Database User
   - Username: `zenvo_admin` (or your choice)
   - Password: Generate strong password and SAVE IT
   - Database User Privileges: Read and write to any database

3. **Configure Network Access**
   - Go to "Network Access" → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Railway to connect

4. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<username>` and `<password>` with your credentials
   - Add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/zenvo_pets?retryWrites=true&w=majority`

---

### **Phase 2: Push Code to GitHub (3 minutes)**

#### Option A: Using Emergent's GitHub Integration
1. In Emergent dashboard, click "Save to GitHub"
2. Authorize GitHub access
3. Create new repository: `zenvo-pets`
4. Push all code

#### Option B: Manual Git Push
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - ZENVO PETS MVP"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/zenvo-pets.git
git branch -M main
git push -u origin main
```

---

### **Phase 3: Deploy Backend on Railway (10 minutes)**

1. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `zenvo-pets` repository
   - Click "Add variables" before deploying

2. **Configure Backend Environment Variables**
   Click "Variables" and add these:

   ```env
   # Database (from MongoDB Atlas)
   MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/zenvo_pets?retryWrites=true&w=majority
   DB_NAME=zenvo_pets

   # Security
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CORS_ORIGINS=*

   # AI Integration
   EMERGENT_LLM_KEY=sk-emergent-e56B79b65D9FaB6Eb8

   # Python
   PYTHONUNBUFFERED=1
   ```

3. **Configure Backend Build Settings**
   - Root Directory: `/backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. **Deploy Backend**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Railway will give you a URL like: `https://your-app.railway.app`
   - **SAVE THIS URL** - you'll need it for frontend

5. **Test Backend**
   ```bash
   curl https://your-backend.railway.app/api/
   # Should return: {"message":"Hello World"}
   ```

---

### **Phase 4: Deploy Frontend on Railway (8 minutes)**

1. **Create New Service in Same Project**
   - In your Railway project, click "New Service"
   - Select "GitHub Repo" (same repo)
   - This creates a second service for frontend

2. **Configure Frontend Environment Variables**
   ```env
   # Backend URL (from Phase 3)
   REACT_APP_BACKEND_URL=https://your-backend.railway.app

   # Node settings
   NODE_ENV=production
   ```

3. **Configure Frontend Build Settings**
   - Root Directory: `/frontend`
   - Build Command: `yarn install && yarn build`
   - Start Command: `npx serve -s build -p $PORT`

4. **Install serve package**
   Add to `/frontend/package.json` dependencies:
   ```json
   "serve": "^14.2.0"
   ```

5. **Deploy Frontend**
   - Click "Deploy"
   - Wait for deployment (3-5 minutes)
   - Railway gives you frontend URL: `https://your-frontend.railway.app`

---

### **Phase 5: Update CORS Settings (2 minutes)**

1. **Update Backend CORS**
   - Go to backend service in Railway
   - Update `CORS_ORIGINS` variable:
   ```
   CORS_ORIGINS=https://your-frontend.railway.app,https://your-frontend.railway.app/
   ```

2. **Redeploy Backend**
   - Railway will auto-redeploy after variable change

---

### **Phase 6: Test Your Deployment (5 minutes)**

1. **Open Your App**
   - Visit: `https://your-frontend.railway.app`
   - Should see ZENVO PETS landing page

2. **Test Registration**
   - Click "Sign In" → "Sign up"
   - Create account with email/password
   - Should redirect to dashboard

3. **Test Core Features**
   - ✅ Create pet profile
   - ✅ Log daily behavior
   - ✅ Generate AI insights (after 3+ logs)
   - ✅ View care summary
   - ✅ Create reminders

4. **Check Backend Logs**
   - In Railway, go to backend service
   - Click "View Logs"
   - Should see successful requests

---

## 🔧 Troubleshooting

### Issue: "CORS Error"
**Fix**: Update `CORS_ORIGINS` in backend to include frontend URL

### Issue: "Database Connection Failed"
**Fix**: 
- Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Verify MONGO_URL is correct
- Ensure password doesn't have special characters (use URL encoding)

### Issue: "AI Insights Not Working"
**Fix**: Verify `EMERGENT_LLM_KEY` is set in backend variables

### Issue: "Frontend Shows Blank Page"
**Fix**: 
- Check browser console for errors
- Verify `REACT_APP_BACKEND_URL` is correct
- Ensure backend is running

---

## 🎯 Custom Domain (Optional)

1. **In Railway**:
   - Go to frontend service → Settings
   - Click "Generate Domain" or "Add Custom Domain"
   - Enter your domain (e.g., zenvopets.com)

2. **In Your Domain Registrar**:
   - Add CNAME record pointing to Railway domain
   - Wait for DNS propagation (5-30 minutes)

3. **Update Environment Variables**:
   - Update `CORS_ORIGINS` in backend
   - Update `REACT_APP_BACKEND_URL` if using custom backend domain

---

## 💰 Railway Pricing

**Free Tier**:
- $5 free credit per month
- Enough for small projects
- ~500 hours of runtime

**Hobby Plan** ($5/month):
- More resources
- Custom domains
- Better performance

**Estimated Monthly Cost**: $0-10 for MVP stage

---

## 🔐 Security Best Practices

1. **Change JWT Secret**
   - Generate new secret for production:
   ```bash
   openssl rand -hex 32
   ```

2. **Restrict CORS**
   - Change from `*` to specific domains

3. **MongoDB Security**
   - Use strong passwords
   - Regular backups
   - Monitor access logs

4. **Environment Variables**
   - Never commit `.env` files to GitHub
   - Use Railway's variable management

---

## 📊 Monitoring

**Railway Dashboard**:
- View logs in real-time
- Monitor resource usage
- Check deployment status

**MongoDB Atlas**:
- Monitor database performance
- Set up alerts
- View query analytics

---

## 🚀 Next Steps After Deployment

1. ✅ Test all features thoroughly
2. 📱 Share app with beta users
3. 📈 Monitor usage and errors
4. 🔄 Set up CI/CD for auto-deployments
5. 💾 Configure database backups
6. 🎨 Add custom domain
7. 📊 Set up analytics (Google Analytics, Mixpanel)

---

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **MongoDB Atlas Support**: https://www.mongodb.com/support

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user and password set
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Railway
- [ ] Backend environment variables set
- [ ] Backend URL obtained
- [ ] Frontend deployed on Railway
- [ ] Frontend environment variables set (with backend URL)
- [ ] CORS updated with frontend URL
- [ ] App tested (registration, pet profile, logging, AI insights)
- [ ] Custom domain configured (optional)
- [ ] Production secrets updated

---

**Estimated Total Time**: 30-40 minutes
**Cost**: Free (with Railway free tier + MongoDB Atlas free tier)

Your app will be live at:
- Frontend: `https://your-frontend.railway.app`
- Backend: `https://your-backend.railway.app`

🎉 **Congratulations! ZENVO PETS is now live!**