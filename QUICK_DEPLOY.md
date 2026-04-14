# Quick Deployment Guide - 15 Minutes

## 🚀 Deploy Your App in 15 Minutes

Follow these steps to get your app live on the internet!

---

## ⚡ Quick Steps

### **Step 1: Install Firebase CLI** (2 minutes)

```bash
npm install -g firebase-tools
```

### **Step 2: Login to Firebase** (1 minute)

```bash
firebase login
```

This opens your browser to sign in with Google.

### **Step 3: Initialize Firebase** (2 minutes)

```bash
cd /Users/vigneshsubbiah/Documents/schoolapp/mayuri
firebase init
```

**Select**:
- [x] Firestore
- [x] Hosting

**Options**:
- Project: Use existing → `school-c0203`
- Firestore rules: `firestore.rules` (default)
- Public directory: `dist` ⚠️ **Important!**
- Single-page app: Yes
- Overwrite index.html: No

### **Step 4: Enable Firebase Services** (5 minutes)

#### Enable Authentication:
1. Go to: https://console.firebase.google.com/project/school-c0203/authentication
2. Click "Get Started"
3. Enable:
   - ✅ Google (add support email)
   - ✅ Email/Password

#### Enable Firestore:
1. Go to: https://console.firebase.google.com/project/school-c0203/firestore
2. Click "Create database"
3. Choose "Start in production mode"
4. Location: asia-south1 (Mumbai)

#### Update Firestore Rules:
1. Go to Firestore → Rules tab
2. Copy rules from `firestore.rules` file
3. Click "Publish"

### **Step 5: Build & Deploy** (5 minutes)

```bash
# Build production app
npm run build

# Deploy to Firebase
firebase deploy
```

**Or use the quick deploy script**:
```bash
./deploy.sh
```

---

## 🌐 Your Live App

After deployment, your app will be live at:

**https://school-c0203.web.app**

---

## ✅ Post-Deployment

### **Test Your Live App**:

1. **Open**: https://school-c0203.web.app
2. **Click "Continue with Google"**
3. **Sign in** with your Google account
4. **Check Firestore**:
   - Go to Firebase Console → Firestore
   - You should see your user in `users` collection
5. **Login as Admin** (demo mode) to test admin features

### **Add Your Domain** (Optional):

1. Firebase Console → Hosting → Connect domain
2. Add: `mayuri.school` or your domain
3. Follow DNS instructions

---

## 🔄 Future Updates

When you make changes:

```bash
# 1. Test locally
npm run dev

# 2. Build
npm run build

# 3. Deploy
firebase deploy --only hosting
```

Or just run:
```bash
./deploy.sh
```

---

## 📱 Share with Users

Share this URL with parents and teachers:
**https://school-c0203.web.app**

**Default Login for Testing**:
- Admin: Use demo mode
- Teachers: Use demo mode or create via admin panel
- Parents: Sign up with Google

---

## 🆘 Troubleshooting

### "Permission denied" errors
- Update Firestore rules (Step 4)
- Check user is approved in Firestore

### App not loading
- Check `dist` folder exists after build
- Verify `firebase.json` has `"public": "dist"`

### Authentication not working
- Add your domain to authorized domains:
  - Firebase Console → Authentication → Settings → Authorized domains

---

## 📊 Monitor Your App

**Firebase Console**: https://console.firebase.google.com/project/school-c0203

Check:
- Authentication → Users (new sign-ups)
- Firestore → Data (database entries)
- Hosting → Dashboard (traffic)
- Analytics → Events (user activity)

---

**That's it! Your app is live! 🎉**

For detailed documentation, see `DEPLOYMENT_GUIDE.md`
