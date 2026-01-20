# 🚀 STRATA-AI Deployment Guide

<p align="center">
  <img src="../frontend/public/logo.svg" alt="STRATA-AI Logo" width="80">
</p>

Complete guide for deploying STRATA-AI to production using free-tier services.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Database Setup (MongoDB Atlas)](#-database-setup-mongodb-atlas)
- [Backend Deployment (Render)](#-backend-deployment-render)
- [Frontend Deployment (Vercel)](#-frontend-deployment-vercel)
- [LLM Configuration (Groq)](#-llm-configuration-groq)
- [Google OAuth Setup](#-google-oauth-setup)
- [Environment Variables](#-environment-variables)
- [Post-Deployment Checklist](#-post-deployment-checklist)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

STRATA-AI is designed to run entirely on free-tier cloud services:

| Component | Service | Tier | Cost |
|-----------|---------|------|------|
| **Database** | MongoDB Atlas | M0 Sandbox | Free |
| **Backend** | Render | Free | Free |
| **Frontend** | Vercel | Hobby | Free |
| **LLM** | Groq | Free API | Free |
| **OAuth** | Google Cloud | Free | Free |

**Estimated monthly cost: $0**

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with your code pushed
- [ ] MongoDB Atlas account
- [ ] Render account
- [ ] Vercel account
- [ ] Groq API key
- [ ] Google Cloud Console account (for OAuth)

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create Account & Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project: `strata-ai`
4. Click **"Build a Database"**
5. Select **M0 FREE** tier
6. Choose a cloud provider and region (closest to your users)
7. Name your cluster: `strata-ai-cluster`
8. Click **"Create"**

### Step 2: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication: Password
4. Username: `strata_admin`
5. Password: Generate a secure password (save this!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IPs from Render
5. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://strata_admin:<password>@strata-ai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database user password
6. Save this as `MONGODB_URI`

---

## 🔧 Backend Deployment (Render)

### Step 1: Create Account & Service

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select the repository containing STRATA-AI

### Step 2: Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `strata-ai-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` (or your production branch) |
| **Root Directory** | `backend` (or `strata-ai/backend`) |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free |

### Step 3: Set Environment Variables

Click **"Environment"** and add:

| Key | Value |
|-----|-------|
| `PROJECT_NAME` | `STRATA-AI` |
| `API_V1_STR` | `/api/v1` |
| `ENVIRONMENT` | `production` |
| `DEBUG` | `False` |
| `SECRET_KEY` | `<generate-32-char-random-string>` |
| `MONGODB_URI` | `<your-mongodb-connection-string>` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `GROQ_API_KEY` | `<your-groq-api-key>` |
| `LLM_MODEL` | `llama-3.3-70b-versatile` |
| `GOOGLE_CLIENT_ID` | `<your-google-client-id>` |
| `GOOGLE_CLIENT_SECRET` | `<your-google-client-secret>` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for build and deployment (5-10 minutes)
3. Note your backend URL: `https://strata-ai-backend.onrender.com`
4. Test: Visit `https://your-url.onrender.com/health`

### Generate Secret Key

```python
# Run this to generate a secure secret key
import secrets
print(secrets.token_urlsafe(32))
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Update API URL

Before deploying, update the API URL in your frontend:

**Option A: Environment Variable**

Create `.env.production`:
```env
VITE_API_URL=https://strata-ai-backend.onrender.com/api/v1
```

**Option B: Direct Update**

Edit `frontend/src/services/api.client.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://strata-ai-backend.onrender.com/api/v1';
```

Commit and push this change.

### Step 2: Create Account & Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"New Project"**
4. Import your GitHub repository

### Step 3: Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` (or `strata-ai/frontend`) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 4: Environment Variables

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://strata-ai-backend.onrender.com/api/v1` |

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Your frontend will be at: `https://strata-ai.vercel.app`

---

## 🤖 LLM Configuration (Groq)

### Get API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Go to **API Keys**
4. Click **"Create API Key"**
5. Name it: `strata-ai-production`
6. Copy the key (starts with `gsk_`)
7. Add to Render environment variables as `GROQ_API_KEY`

### Rate Limits (Free Tier)

| Model | Requests/min | Tokens/min |
|-------|--------------|------------|
| llama-3.3-70b-versatile | 30 | 6,000 |

---

## 🔐 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Name: `STRATA-AI`
4. Click **"Create"**

### Step 2: Enable APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google Identity Services**
   - **Google People API** (optional, for profile info)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public access)
3. Fill in required fields:
   - App name: `STRATA-AI`
   - User support email: Your email
   - Developer contact: Your email
4. Click **"Save and Continue"**
5. Skip scopes (defaults are fine)
6. Add test users if needed
7. Click **"Save and Continue"**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **Web application**
4. Name: `STRATA-AI Web Client`

5. **Authorized JavaScript origins** (add all):
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   https://strata-ai.vercel.app
   https://your-custom-domain.com
   ```

6. **Authorized redirect URIs** (optional, may not be needed):
   ```
   http://localhost:5173
   https://strata-ai.vercel.app
   ```

7. Click **"Create"**

### Step 5: Copy Credentials

1. Copy **Client ID** (ends with `.apps.googleusercontent.com`)
2. Copy **Client Secret**
3. Add to your backend environment:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Step 6: Verify Setup

After deploying:
1. Visit your frontend
2. Click "Sign in with Google"
3. Google popup should appear
4. After sign-in, you should be redirected to dashboard

### Production Checklist for Google OAuth

- [ ] Added production frontend URL to authorized origins
- [ ] OAuth consent screen published (not in testing mode)
- [ ] Verified domain ownership (if required)
- [ ] Tested sign-in flow on production

---

## 🔐 Environment Variables

### Complete List

| Variable | Required | Production Value |
|----------|----------|------------------|
| `PROJECT_NAME` | ❌ | `STRATA-AI` |
| `API_V1_STR` | ❌ | `/api/v1` |
| `ENVIRONMENT` | ❌ | `production` |
| `DEBUG` | ❌ | `False` |
| `SECRET_KEY` | ✅ | `<random-32-chars>` |
| `MONGODB_URI` | ✅ | `mongodb+srv://...` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `1440` |
| `GROQ_API_KEY` | ✅ | `gsk_...` |
| `LLM_MODEL` | ❌ | `llama-3.3-70b-versatile` |
| `GOOGLE_CLIENT_ID` | ❌ | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ❌ | `GOCSPX-xxx` |
| `FRONTEND_URL` | ❌ | `https://your-app.vercel.app` |

### Security Notes

- Never commit `.env` files to git
- Use Render's secret environment variables
- Rotate `SECRET_KEY` periodically
- Keep `GROQ_API_KEY` and `GOOGLE_CLIENT_SECRET` secure

---

## ✅ Post-Deployment Checklist

### Backend Verification

- [ ] Health check returns OK: `GET /health`
- [ ] API docs accessible (if DEBUG=True): `GET /docs`
- [ ] Can register new user: `POST /api/v1/auth/register`
- [ ] Can login: `POST /api/v1/auth/login`
- [ ] Google OAuth client ID endpoint works: `GET /api/v1/auth/google/client-id`
- [ ] Database connection working

### Frontend Verification

- [ ] Login page loads
- [ ] Google Sign-In button appears (if configured)
- [ ] Can register and login with email
- [ ] Can sign in with Google
- [ ] Dashboard loads after login
- [ ] API calls succeed (check browser console)
- [ ] Charts render correctly

### Authentication Verification

- [ ] Email/password registration works
- [ ] Email/password login works
- [ ] Google OAuth sign-in works
- [ ] Google OAuth sign-up works
- [ ] Password reset request works
- [ ] Password reset with token works
- [ ] JWT token persists across page refresh

### Integration Verification

- [ ] Create financial record
- [ ] View runway calculation
- [ ] Run a scenario
- [ ] Get AI suggestions
- [ ] Create a roadmap

---

## 🔧 Troubleshooting

### Backend Issues

**Build fails on Render:**
```
Check requirements.txt has all dependencies
Ensure Python version compatibility
Check build logs for specific errors
```

**Database connection fails:**
```
Verify MONGODB_URI is correct
Check Network Access allows Render IPs
Ensure database user has correct permissions
```

**JWT errors:**
```
Ensure SECRET_KEY is set
Check token expiration settings
Verify algorithm is HS256
```

**Google OAuth fails:**
```
Verify GOOGLE_CLIENT_ID is correct
Check authorized origins include your frontend URL
Ensure OAuth consent screen is configured
Check browser console for specific errors
```

### Frontend Issues

**API calls fail:**
```
Check CORS settings in backend (FRONTEND_URL)
Verify VITE_API_URL is correct
Check browser console for errors
Ensure backend is running
```

**Google Sign-In button not appearing:**
```
Check backend /auth/google/client-id endpoint
Verify GOOGLE_CLIENT_ID is set in backend
Check browser console for errors
```

**Build fails on Vercel:**
```
Check TypeScript errors
Ensure all dependencies in package.json
Check node_modules not in gitignore
```

### Common Fixes

**Render free tier sleeps after 15 min:**
- First request may take 30-60 seconds
- Consider upgrading to paid tier for production
- Use a service like UptimeRobot to ping every 14 min

**CORS errors:**
- Verify frontend URL is in backend CORS origins
- Set `FRONTEND_URL` environment variable
- Update `app/main.py` with production URL if needed

---

## 🔄 Continuous Deployment

### Automatic Deploys

Both Render and Vercel support automatic deployments:

1. Push to `main` branch
2. Services automatically rebuild
3. New version deployed

### Manual Deploy

**Render:**
- Go to Dashboard → Select Service → Click "Manual Deploy"

**Vercel:**
- Go to Dashboard → Select Project → Deployments → "Redeploy"

---

## 📊 Monitoring

### Render Dashboard

- View logs in real-time
- Monitor memory/CPU usage
- Track request counts

### Vercel Analytics

- Enable Analytics in project settings
- View page views and web vitals
- Monitor edge function performance

### MongoDB Atlas

- Monitor database connections
- View query performance
- Set up alerts for issues

---

## 🎉 You're Done!

Your STRATA-AI instance should now be live at:

- **Frontend:** `https://strata-ai.vercel.app`
- **Backend:** `https://strata-ai-backend.onrender.com`
- **API Docs:** `https://strata-ai-backend.onrender.com/docs` (if DEBUG=True)

**Features Available:**
- ✅ Email/Password Authentication
- ✅ Google OAuth Sign-In
- ✅ Password Reset
- ✅ Financial Data Management
- ✅ AI Runway Prediction
- ✅ Scenario Analysis
- ✅ AI Strategy Suggestions
- ✅ Execution Roadmaps

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
