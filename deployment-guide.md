# 🚀 LLM Prep Planner - Deployment Guide

✅ **Build Status**: Production build successful!
🔥 **Authentication**: Firebase ready
💾 **Database**: SQLite (requires persistent storage)

---

## 🚀 Quick Deploy Options

### **Option A: Railway (Recommended)**
**Perfect for SQLite + Simple deployment**

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository
   - **Add environment variables** (see below)
   - Deploy automatically!

### **Option B: Render**
**Alternative with SQLite support**

1. **Connect repo** at [render.com](https://render.com)
2. **Web Service** → **Connect GitHub**
3. **Add environment variables**
4. **Build & Deploy**

### **Option C: Vercel (Advanced)**
**Requires database migration to Firestore**

1. **Install CLI**: `npm i -g vercel`
2. **Deploy**: `vercel`
3. **Note**: SQLite won't work, need Firestore migration

---

## 📋 Environment Variables

**Copy these to your deployment platform**:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB7UWoF88FaTDoISOTqrwROfyj70CzwwmE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=planner-a6134.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=planner-a6134
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=planner-a6134.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=750059654723
NEXT_PUBLIC_FIREBASE_APP_ID=1:750059654723:web:5560de493d061194148ef6
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1V0TBL0GE4
```

---

## 🔧 Firebase Console Setup

**After deployment, update Firebase settings**:

1. **Go to**: [Firebase Console](https://console.firebase.google.com/)
2. **Select**: `planner-a6134` project
3. **Authentication** → **Settings** → **Authorized domains**
   - **Add your domain**: `your-app-name.railway.app` (or your actual domain)
4. **Save changes**

---

## ⚙️ Platform-Specific Instructions

### **Railway Setup**
1. **Environment Variables**: Add in Railway dashboard
2. **Custom Domain**: Available in pro plan
3. **Automatic deploys**: On every Git push

### **Render Setup**
1. **Build Command**: `npm run build` (auto-detected)
2. **Start Command**: `npm start` (auto-detected)
3. **Node Version**: 18+ (set in settings)

---

## 🎯 Post-Deployment Checklist

After your app is live:

- [ ] **Test authentication**: Sign up with new account
- [ ] **Import data**: Use the Excel import feature
- [ ] **Check all pages**: Today, Calendar, Problems, etc.
- [ ] **Test on mobile**: Ensure responsive design works
- [ ] **Update Firebase domains**: Add production URL

---

## 🚨 Troubleshooting

**Common issues**:

- **Auth errors**: Check Firebase authorized domains
- **Build fails**: Environment variables not set
- **Database issues**: Platform doesn't support SQLite (use Railway/Render)
- **Import not working**: File paths may differ in production

---

## 🎉 You're Ready!

Your LLM Prep Planner is production-ready with:

✅ **Firebase Authentication**
✅ **SQLite Database** 
✅ **Excel Import/Export**
✅ **Responsive Design**
✅ **Protected Routes**
✅ **Production Build**

**Choose Railway for the easiest deployment! 🚄**
