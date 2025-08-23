# 🚀 Quick Deploy Steps

## Step 1: Initialize Git Repository (if not done)

```bash
# Initialize git (if needed)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit - LLM Prep Planner ready for deployment"
```

## Step 2: Push to GitHub

1. **Create a new repository** on [GitHub.com](https://github.com/new)
2. **Repository name**: `llm-prep-planner` (or your choice)
3. **Make it public** or private (your choice)
4. **Don't initialize** with README (we already have files)

```bash
# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/llm-prep-planner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy on Railway

1. **Go to**: [railway.app](https://railway.app) 
2. **Sign up** with GitHub
3. **Click**: "Deploy from GitHub repo"
4. **Select**: Your `llm-prep-planner` repository
5. **Add environment variables**:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB7UWoF88FaTDoISOTqrwROfyj70CzwwmE
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=planner-a6134.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=planner-a6134
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=planner-a6134.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=750059654723
   NEXT_PUBLIC_FIREBASE_APP_ID=1:750059654723:web:5560de493d061194148ef6
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1V0TBL0GE4
   ```
6. **Deploy!** Railway will build and deploy automatically

## Step 4: Update Firebase Settings

1. **Go to**: [Firebase Console](https://console.firebase.google.com/)
2. **Select**: `planner-a6134`
3. **Authentication** → **Settings** → **Authorized domains**
4. **Add**: Your Railway domain (e.g., `your-app-xyz.railway.app`)

## 🎉 Done!

Your app will be live at: `https://your-app-xyz.railway.app`

**Total time**: ~10 minutes for first deployment!

---

### Alternative: One-Click Deploy Button

Add this to your GitHub README for future deployments:

```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/llm-prep-planner)
```
