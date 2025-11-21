# Railway Deployment Guide

This guide will help you deploy the MMT Media Accountability Platform to Railway.

## Architecture

The application consists of two separate services:
1. **Backend** (Node.js/Express API with PostgreSQL)
2. **Frontend** (React/Vite SPA)

## Prerequisites

- Railway account
- GitHub repository connected to Railway

## Step 1: Deploy Backend (Already Completed ✓)

Your backend should already be deployed. Make sure it has:

### Backend Environment Variables

In your Railway backend service, set these environment variables:

```
DATABASE_URL=<automatically set by Railway PostgreSQL>
JWT_SECRET=<generate a secure random string>
CLAUDE_API_KEY=<your Anthropic API key>
EMAIL_SERVICE=gmail
EMAIL_USER=<your email>
EMAIL_PASSWORD=<your email app password>
NODE_ENV=production
PORT=3001
FRONTEND_URL=<will be set after frontend deployment>
```

### Backend Build & Start Commands

Railway should auto-detect these from `package.json`, but verify:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

## Step 2: Deploy Frontend

### 2.1 Create New Service in Railway

1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select your repository
3. Railway will try to auto-detect - click **"Add variables"** before deploying

### 2.2 Configure Frontend Root Directory

Since this is a monorepo, you need to tell Railway where the frontend code is:

1. Go to **Settings** → **Service Settings**
2. Set **Root Directory** to: `frontend`

### 2.3 Set Frontend Environment Variables

Add this environment variable:

```
VITE_API_URL=<your-backend-railway-url>/api
```

Example: `VITE_API_URL=https://mmt-backend.up.railway.app/api`

### 2.4 Configure Build & Start Commands

Railway should auto-detect from `package.json`, but verify:

- **Build Command**: `npm run build`
- **Start Command**: `npm run serve`

The `serve` script will run Vite's preview server to serve the built static files.

### 2.5 Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** to get a public URL

### 2.6 Update Backend CORS

Now that you have the frontend URL, go back to your **backend service**:

1. Add/update the environment variable:
   ```
   FRONTEND_URL=https://your-frontend.up.railway.app
   ```

2. Redeploy the backend for CORS changes to take effect

## Step 3: Database Setup

If not already done, in your backend service:

1. **Add PostgreSQL database** (Railway will auto-provision it)
2. Run migrations:
   - In Railway backend service, go to **Settings** → **Deploy Triggers**
   - Or manually run: `npm run db:push` in the deployment
3. Seed the database (optional):
   - Run: `npm run db:seed`

## Important Notes

### Environment Variables Summary

**Backend Service:**
```env
DATABASE_URL=<postgresql url from Railway>
JWT_SECRET=<random secure string>
CLAUDE_API_KEY=sk-ant-api...
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app-password>
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.up.railway.app
```

**Frontend Service:**
```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

### Troubleshooting

**CORS Errors:**
- Make sure `FRONTEND_URL` in backend matches your frontend Railway domain exactly
- Include the protocol (`https://`) but no trailing slash

**API Connection Errors:**
- Verify `VITE_API_URL` in frontend includes `/api` at the end
- Check that backend is running and accessible

**Build Failures:**
- Frontend: Make sure **Root Directory** is set to `frontend`
- Backend: Make sure **Root Directory** is set to `backend` (or empty if at root)
- Check Node.js version compatibility (both services need Node 18+)

**Database Connection:**
- Ensure PostgreSQL plugin is added to backend service
- Run `npm run db:push` to sync the schema
- Run `npm run db:seed` to add initial media outlets

**Email Sending Issues:**
- **IMPORTANT:** Email functionality requires EMAIL_USER and EMAIL_PASSWORD to be configured
- For Gmail: Use an "App Password" (not your regular Gmail password)
  - Go to Google Account → Security → 2-Step Verification → App Passwords
  - Generate an app password for "Mail"
  - Use this as EMAIL_PASSWORD
- For other email services: Set EMAIL_SERVICE to your provider (e.g., "outlook", "yahoo")
- **Without email configuration:** The "Send" button will timeout/fail. Users must use "Copy to Clipboard" instead
- Check backend logs for "Email sending failed" errors if emails aren't working

### Verify Deployment

1. Visit your frontend URL
2. Try registering a new account
3. Create an incident and generate a letter
4. Check Railway logs if anything fails

## Monitoring

- Check **Deployment Logs** in Railway for both services
- Backend logs show API requests and errors
- Frontend logs show build output and serving info

## Cost Optimization

- Railway offers $5 free credit monthly
- Both services should fit within free tier for development
- Database storage and compute are the main costs

## Updates

To deploy updates:
1. Push changes to GitHub
2. Railway auto-deploys on push to your main branch
3. Or manually trigger deployment in Railway dashboard
