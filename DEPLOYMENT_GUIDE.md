# STRATA-AI Deployment Guide (100% Free)

Deploy your project with **Render** (Backend) and **Vercel** (Frontend).

---

## Prerequisites

1.  A **GitHub** account: [github.com](https://github.com)
2.  A **Render** account: [render.com](https://render.com) (sign up with GitHub)
3.  A **Vercel** account: [vercel.com](https://vercel.com) (sign up with GitHub)

---

## Step 1: Push Code to GitHub

Your project already has a git repository. Push it to GitHub.

### 1.1. Create a New Repository on GitHub
Go to [github.com/new](https://github.com/new) and create a **new, empty repository** (do NOT initialize with README).

### 1.2. Push Your Local Code
Open a terminal in your project root (`Strata Final/strata-ai`) and run:

```bash
# Add your GitHub repo as a remote (replace <YOUR_USERNAME> and <YOUR_REPO_NAME>)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git

# Push your code
git push -u origin strata-v1
```

---

## Step 2: Deploy Backend to Render

### 2.1. Go to Render Dashboard
Navigate to [dashboard.render.com](https://dashboard.render.com) and click **"New +"** > **"Blueprint"**.

### 2.2. Connect Your Repository
Select your GitHub repository. Render will automatically detect the `render.yaml` file.

### 2.3. Configure Environment Variables
After creating the service, go to your **strata-ai-backend** service, navigate to **Environment** and add the following variables:

| Key                        | Value                                             |
| :------------------------- | :------------------------------------------------ |
| `SECRET_KEY`               | `<generate a random 64-char string>`              |
| `MONGODB_URI`              | `<your MongoDB Atlas connection string>`          |
| `GROQ_API_KEY`             | `<your Groq API key>`                             |
| `FRONTEND_URL`             | `https://your-frontend-name.vercel.app` (add later) |
| `GOOGLE_CLIENT_ID`         | (Optional) Your Google OAuth Client ID            |
| `GOOGLE_CLIENT_SECRET`     | (Optional) Your Google OAuth Secret               |

### 2.4. Deploy!
Click **"Manual Deploy"** > **"Deploy latest commit"**.

> **Note:** Free tier services spin down after 15 minutes of inactivity. The first request after a spindown may take 30-60 seconds.

Your backend URL will be something like: `https://strata-ai-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1. Open Terminal in `frontend` Directory
```bash
cd frontend
```

### 3.2. Login to Vercel
```bash
vercel login
```
Follow the prompts to log in via browser.

### 3.3. Deploy
```bash
vercel --prod
```
Answer the prompts:
-   **Set up and deploy?** `Y`
-   **Which scope?** Select your account.
-   **Link to existing project?** `N`
-   **Project name?** `strata-ai` (or your choice)
-   **Directory?** `./` (current directory)
-   **Overwrite settings?** `N`

### 3.4. Configure Environment Variable

After deployment, go to your project on [vercel.com](https://vercel.com):
1.  Go to **Settings** > **Environment Variables**.
2.  Add:
    | Key | Value |
    | :-- | :---- |
    | `VITE_API_URL` | `https://strata-ai-backend.onrender.com/api/v1` |
3.  **Redeploy** the project for the variable to take effect.

---

## Step 4: Final Configuration

### 4.1. Update CORS on Backend
Go back to your **Render** dashboard:
1.  Go to **strata-ai-backend** > **Environment**.
2.  Update `FRONTEND_URL` to your Vercel URL (e.g., `https://strata-ai.vercel.app`).
3.  **Redeploy** the backend.

---

## 🎉 Done!

Your app is now live at your **Vercel URL**.

| Service  | URL Example                                  |
| :------- | :------------------------------------------- |
| Frontend | `https://strata-ai.vercel.app`               |
| Backend  | `https://strata-ai-backend.onrender.com`     |
| API Docs | `https://strata-ai-backend.onrender.com/docs`|
