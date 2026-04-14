# Manual Deployment Guide

## Step-by-Step Instructions to Deploy Your App

### Prerequisites
- Firebase CLI installed (already done ✓)
- Google account access
- Terminal/Command line access

---

## Method 1: Using the Deploy Script (Easiest)

### Step 1: Open Terminal
Open your terminal application (Terminal on Mac)

### Step 2: Navigate to Project
```bash
cd /Users/vigneshsubbiah/Documents/schoolapp/mayuri
```

### Step 3: Make Script Executable
```bash
chmod +x deploy.sh
```

### Step 4: Run Deploy Script
```bash
./deploy.sh
```

The script will:
1. Check if you're logged in to Firebase
2. If not logged in, open a browser for you to authenticate
3. Build your production app
4. Deploy to Firebase Hosting

---

## Method 2: Manual Commands (Step by Step)

### Step 1: Navigate to Project Directory
```bash
cd /Users/vigneshsubbiah/Documents/schoolapp/mayuri
```

### Step 2: Login to Firebase
```bash
firebase login
```

**What happens:**
- Opens your default browser
- Shows Firebase authentication page
- Sign in with: **vis@unboundsecurity.ai**
- Grant permissions
- Browser shows "Success! You're logged in"
- Close browser and return to terminal

### Step 3: Verify Login
```bash
firebase projects:list
```

**Expected output:**
```
┌─────────────────┬─────────────┬─────────────────┐
│ Project Display │ Project ID  │ Resource        │
│ Name            │             │ Location ID     │
├─────────────────┼─────────────┼─────────────────┤
│ school          │ school-c0203│ [DEFAULT]       │
└─────────────────┴─────────────┴─────────────────┘
```

### Step 4: Build Production App
```bash
npm run build
```

**Expected output:**
```
✓ 1734 modules transformed.
✓ built in 1.60s
```

**This creates:**
- `dist/` folder with optimized production files
- `dist/index.html` - Main HTML file
- `dist/assets/` - CSS and JavaScript bundles

### Step 5: Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

**Expected output:**
```
=== Deploying to 'school-c0203'...

i  deploying hosting
i  hosting[school-c0203]: beginning deploy...
i  hosting[school-c0203]: found 3 files in dist
✔  hosting[school-c0203]: file upload complete
i  hosting[school-c0203]: finalizing version...
✔  hosting[school-c0203]: version finalized
i  hosting[school-c0203]: releasing new version...
✔  hosting[school-c0203]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/school-c0203/overview
Hosting URL: https://school-c0203.web.app
```

### Step 6: Verify Deployment
Open your browser and visit:
```
https://school-c0203.web.app
```

---

## Method 3: Deploy Firestore Rules and Indexes (Important!)

After deploying the hosting, you need to deploy the database rules and indexes:

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### Or Deploy Everything at Once
```bash
firebase deploy
```

---

## Troubleshooting

### Error: "Not logged in"
**Solution:**
```bash
firebase logout
firebase login
```

### Error: "No currently active project"
**Solution:**
```bash
firebase use school-c0203
```

### Error: "Build failed"
**Solution:**
```bash
# Clean node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

### Error: "Permission denied on deploy.sh"
**Solution:**
```bash
chmod +x deploy.sh
```

### Error: "dist folder not found"
**Solution:**
```bash
# Build the app first
npm run build
# Then deploy
firebase deploy --only hosting
```

---

## After Deployment Checklist

### 1. Enable Firebase Services
Go to: https://console.firebase.google.com/project/school-c0203

#### Enable Authentication:
1. Click "Authentication" → "Get Started"
2. Enable "Google" sign-in
   - Add support email: vis@unboundsecurity.ai
3. Enable "Email/Password" sign-in

#### Enable Firestore:
1. Click "Firestore Database" → "Create database"
2. Start in "Production mode"
3. Choose location: "asia-south1 (Mumbai)"

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 4. Add Authorized Domain
1. Go to Authentication → Settings → Authorized domains
2. Add your custom domain if you have one

---

## Testing Your Deployed App

### 1. Open App
Visit: https://school-c0203.web.app

### 2. Test Google Sign-In
- Click "Continue with Google"
- Sign in with your Google account
- Should redirect to home page

### 3. Test Admin Features
- Click "Login as Admin (Demo)"
- Check dashboard loads
- Try creating a user
- Try marking attendance
- Check fee analytics

### 4. Check Firestore Data
1. Go to Firebase Console
2. Click "Firestore Database"
3. Verify collections exist:
   - users
   - attendance
   - fee_payments

---

## Future Updates

When you make code changes:

```bash
# 1. Build new version
npm run build

# 2. Deploy
firebase deploy --only hosting
```

Or just run:
```bash
./deploy.sh
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Login | `firebase login` |
| Build | `npm run build` |
| Deploy Hosting | `firebase deploy --only hosting` |
| Deploy Rules | `firebase deploy --only firestore:rules` |
| Deploy Indexes | `firebase deploy --only firestore:indexes` |
| Deploy All | `firebase deploy` |
| Check Status | `firebase projects:list` |
| Logout | `firebase logout` |

---

## Support

If you encounter issues:
1. Check the error message in terminal
2. Look at the Troubleshooting section above
3. Check Firebase Console for errors
4. Check browser console (F12) for frontend errors

---

## Your App URLs

- **Live App**: https://school-c0203.web.app
- **Firebase Console**: https://console.firebase.google.com/project/school-c0203
- **Authentication**: https://console.firebase.google.com/project/school-c0203/authentication
- **Firestore**: https://console.firebase.google.com/project/school-c0203/firestore

---

**That's it! Your app should now be live!** 🎉
