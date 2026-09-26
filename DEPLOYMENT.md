# 🚀 FLAMES Game - Complete Deployment Guide

This guide walks you through deploying your **FLAMES MERN Stack Application**:
- **Backend API**: Hosted on **Render** (Node.js Web Service)
- **Frontend App**: Hosted on **Vercel** (Fast Edge Global CDN)
- **Database**: **MongoDB Atlas** (Free M0 Cloud Cluster) or persistent fallback

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Push Code to GitHub](#2-step-1-push-code-to-github)
3. [Step 2: Setup Free MongoDB Atlas Database](#3-step-2-setup-free-mongodb-atlas-database)
4. [Step 3: Deploy Backend on Render](#4-step-3-deploy-backend-on-render)
5. [Step 4: Deploy Frontend on Vercel](#5-step-4-deploy-frontend-on-vercel)
6. [Step 5: Verify & Test](#6-step-5-verify--test)
7. [Troubleshooting & FAQs](#7-troubleshooting--faqs)

---

## 1. Prerequisites
- A [GitHub](https://github.com/) account
- A free [Render](https://render.com/) account
- A free [Vercel](https://vercel.com/) account
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (optional, for cloud database)

---

## 2. Step 1: Push Code to GitHub

Open your terminal in the root folder (`GAMEAPP`) and run:

```bash
# 1. Stage all deployment-ready files
git add .

# 2. Create the initial commit
git commit -m "feat: complete FLAMES app ready for Vercel and Render deployment"

# 3. Create a new repository on GitHub (e.g. flames-game-app), then link and push:
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

---

## 3. Step 2: Setup Free MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a **Free Shared Cluster (M0)**.
2. In **Security > Database Access**:
   - Add a new database user (e.g., `flames_user` with a strong password).
3. In **Security > Network Access**:
   - Click **Add IP Address** -> select **Allow Access from Anywhere** (`0.0.0.0/0`) -> Confirm.
4. In **Database Deployments**:
   - Click **Connect** -> Choose **Drivers** (Node.js).
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://flames_user:<password>@cluster0.xxxxx.mongodb.net/flames_game?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password.

> **Note:** If you don't configure MongoDB, the backend automatically runs in **Resilient Local Fallback Mode**.

---

## 4. Step 3: Deploy Backend on Render

### Option A: Using the Render Dashboard (Recommended)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repository.
4. Fill in the deployment details:
   - **Name**: `flames-game-backend`
   - **Region**: Any region close to you (e.g., *Oregon* or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Under **Environment Variables**, click **Add Environment Variable** and add:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Render port (or let Render set it) |
| `MONGODB_URI` | *Your MongoDB Atlas Connection String* | Cloud database connection |
| `ADMIN_SECRET_KEY` | `flamesadmin2026` (or any custom secret) | Password to unlock `/admin` dashboard |
| `CLIENT_ORIGIN` | `*` (or your Vercel URL once deployed) | Allowed frontend CORS domains |

6. Under **Advanced Settings**:
   - **Health Check Path**: `/api/health`

7. Click **Create Web Service**.
8. Once the build finishes and status shows **Live**, copy your Render service URL:
   ```
   https://flames-game-backend.onrender.com
   ```
   Test it in your browser: `https://flames-game-backend.onrender.com/` (you will see the online status JSON response).

---

## 5. Step 4: Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Project Name**: `flames-game` (or your choice)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`client`** (or leave as `./` — both are pre-configured!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Expand **Environment Variables** and add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://flames-game-backend.onrender.com` *(Your Render URL from Step 3 without trailing slash)* |

6. Click **Deploy**.
7. Vercel will build and deploy your app in ~30 seconds.
8. Once deployed, click your live URL:
   ```
   https://your-flames-app.vercel.app
   ```

---

## 6. Step 5: Verify & Test

1. **Homepage & Calculation**:
   - Open your Vercel URL.
   - Enter two names (e.g. `Romeo` and `Juliet`) and click **Calculate FLAMES**.
   - Watch the interactive visualizer, letter strike-through, particle fireworks, and relationship outcome card.
2. **Admin Command Center**:
   - Click the shield icon in the navigation bar or visit `/admin`.
   - Enter your `ADMIN_SECRET_KEY` (e.g., `flamesadmin2026`).
   - Check player activity, database status, search/filter records, and test **Export CSV**.
3. **SPA Navigation & Refresh**:
   - Refresh `/admin` in your browser. Thanks to `vercel.json`, it reloads cleanly without 404.

---

## 7. Troubleshooting & FAQs

### Q: The first request on Render takes 30-50 seconds.
**A:** On Render's Free tier, services spin down after 15 minutes of inactivity. The first request after sleep ("cold start") takes about 30 seconds to wake up. Once awake, subsequent requests respond instantly. The client includes offline fallback calculation so users are never blocked even during wake-up!

### Q: Getting CORS errors in the browser console.
**A:** Ensure your Render backend environment variable `CLIENT_ORIGIN` includes your Vercel domain (e.g., `https://your-flames-app.vercel.app`) or is set to `*`. All `.vercel.app` domains are automatically approved by our server CORS filter.

### Q: Refreshing a route on Vercel gives 404.
**A:** Pre-configured `client/vercel.json` and root `vercel.json` include SPA rewrite rules pointing all traffic to `/index.html`. Make sure those files are committed to your repository.

### Q: How do I change the Admin Secret Key?
**A:** Update the `ADMIN_SECRET_KEY` environment variable in your Render Web Service settings and redeploy.
