# ✅ Railway Deployment Checklist

## Before You Start
- [ ] Read `RAILWAY_DEPLOYMENT.md` completely
- [ ] Have Railway account ready
- [ ] Have GitHub account ready  
- [ ] Have MongoDB Atlas account ready

---

## Phase 1: MongoDB Atlas Setup
- [ ] Created MongoDB Atlas cluster (free tier)
- [ ] Created database user with username and password
- [ ] Set network access to 0.0.0.0/0 (allow all)
- [ ] Copied connection string
- [ ] Replaced `<username>` and `<password>` in connection string
- [ ] Added database name to connection string: `/zenvo_pets`
- [ ] **SAVED** connection string somewhere safe

**Your MongoDB URL should look like:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/zenvo_pets?retryWrites=true&w=majority
```

---

## Phase 2: GitHub Setup
- [ ] Code pushed to GitHub repository
- [ ] Repository is accessible
- [ ] All files committed (check: railway.json, Procfile exist)

---

## Phase 3: Backend Deployment
- [ ] Created new Railway project
- [ ] Connected GitHub repository
- [ ] Set root directory to `/backend`
- [ ] Added all environment variables:
  - [ ] `MONGO_URL` (from MongoDB Atlas)
  - [ ] `DB_NAME=zenvo_pets`
  - [ ] `JWT_SECRET` (generated new secret)
  - [ ] `CORS_ORIGINS=*` (will update later)
  - [ ] `EMERGENT_LLM_KEY=sk-emergent-e56B79b65D9FaB6Eb8`
  - [ ] `PYTHONUNBUFFERED=1`
- [ ] Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- [ ] Deployed backend successfully
- [ ] **SAVED** backend URL: `_________________________`
- [ ] Tested backend: `curl https://your-backend.railway.app/api/`
- [ ] Backend returns: `{"message":"Hello World"}`

---

## Phase 4: Frontend Deployment  
- [ ] Created new service in same Railway project
- [ ] Connected same GitHub repository
- [ ] Set root directory to `/frontend`
- [ ] Added environment variables:
  - [ ] `REACT_APP_BACKEND_URL=https://your-backend.railway.app`
  - [ ] `NODE_ENV=production`
- [ ] Set build command: `yarn install && yarn build`
- [ ] Set start command: `npx serve -s build -p $PORT`
- [ ] Deployed frontend successfully
- [ ] **SAVED** frontend URL: `_________________________`

---

## Phase 5: CORS Update
- [ ] Went back to backend service
- [ ] Updated `CORS_ORIGINS` to include frontend URL
- [ ] Backend redeployed automatically
- [ ] Waited 2-3 minutes for deployment

---

## Phase 6: Testing
- [ ] Opened frontend URL in browser
- [ ] Landing page loads correctly
- [ ] Can navigate to login/signup page
- [ ] Registration works (create test account)
- [ ] Login works with test account
- [ ] Redirected to dashboard after login
- [ ] Can create pet profile
- [ ] Can log daily behavior
- [ ] Created 3+ daily logs
- [ ] Generated AI weekly insights (check if Gemini works)
- [ ] AI summary displays correctly
- [ ] Can view care summary page
- [ ] Can create reminders
- [ ] Can mark reminders complete
- [ ] All features working end-to-end

---

## Phase 7: Security (Important!)
- [ ] Changed `JWT_SECRET` to new random value
  ```bash
  # Generate new secret:
  openssl rand -hex 32
  ```
- [ ] Updated `CORS_ORIGINS` to specific frontend URL (remove `*`)
- [ ] MongoDB Atlas password is strong
- [ ] No sensitive data committed to GitHub

---

## Phase 8: Optional Enhancements
- [ ] Added custom domain to frontend
- [ ] Added custom domain to backend  
- [ ] Set up monitoring/alerts in Railway
- [ ] Configured MongoDB Atlas backup schedule
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Added Google Analytics or similar

---

## Troubleshooting Checklist
If something doesn't work:

### Frontend shows blank page
- [ ] Check browser console for errors
- [ ] Verify `REACT_APP_BACKEND_URL` is correct
- [ ] Check Railway frontend logs for build errors

### CORS errors
- [ ] Verify frontend URL in backend's `CORS_ORIGINS`
- [ ] Include both with and without trailing slash
- [ ] Backend redeployed after CORS update

### Database connection failed
- [ ] MongoDB Atlas IP whitelist includes 0.0.0.0/0
- [ ] `MONGO_URL` environment variable is correct
- [ ] Database user has read/write permissions
- [ ] Password doesn't have special characters (or is URL-encoded)

### AI insights not working
- [ ] `EMERGENT_LLM_KEY` is set in backend
- [ ] At least 3 daily logs exist for current week
- [ ] Check backend logs for Gemini API errors

### 404 errors on API calls
- [ ] Backend URL includes `/api` prefix in calls
- [ ] `REACT_APP_BACKEND_URL` doesn't have trailing slash
- [ ] Backend is running (check Railway dashboard)

---

## Final URLs

**Frontend (Your App):**
```
https://_________________________
```

**Backend (API):**
```
https://_________________________
```

**MongoDB (Database):**
```
mongodb+srv://_______________
```

---

## Success! 🎉

Your app is now live! Share it with:
- [ ] Friends and family for feedback
- [ ] Beta testers
- [ ] Social media

---

## Post-Deployment Tasks

**Week 1:**
- [ ] Monitor Railway logs daily
- [ ] Check MongoDB usage
- [ ] Gather user feedback
- [ ] Fix any reported bugs

**Week 2-4:**
- [ ] Analyze user behavior
- [ ] Implement most-requested features
- [ ] Optimize performance
- [ ] Add analytics tracking

**Month 2+:**
- [ ] Consider paid Railway plan if needed
- [ ] Scale database as users grow
- [ ] Add more AI features
- [ ] Launch marketing campaign

---

**Deployment Date:** ________________

**Deployed By:** ________________

**Status:** 🟢 Live | 🟡 Testing | 🔴 Issues

---

Need help? Check:
- `RAILWAY_DEPLOYMENT.md` - Complete guide
- Railway docs - https://docs.railway.app
- MongoDB Atlas support - https://www.mongodb.com/support
