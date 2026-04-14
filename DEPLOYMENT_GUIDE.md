# Deployment Guide - Mayuri Playschool App

## 🚀 Complete Guide to Deploy Your App

This guide will help you deploy the Mayuri app to Firebase Hosting with full database integration.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Firebase project created (`school-c0203`)
- ✅ Firebase CLI installed
- ✅ Node.js installed (v18+)
- ✅ Git installed

---

## 🔧 Step 1: Firebase Setup

### 1.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 1.2 Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate with Google.

### 1.3 Initialize Firebase in Your Project

```bash
cd /Users/vigneshsubbiah/Documents/schoolapp/mayuri
firebase init
```

**Select these options**:
1. **Which Firebase features?**
   - [x] Firestore
   - [x] Hosting

2. **Use existing project?** → Yes
3. **Select project**: `school-c0203`

4. **Firestore Rules**:
   - Use default `firestore.rules` file
   - We'll update it later

5. **Firestore Indexes**:
   - Use default `firestore.indexes.json`

6. **Hosting Setup**:
   - **Public directory**: `dist` (important!)
   - **Single-page app**: Yes
   - **GitHub auto-deploy**: No (for now)

---

## 🔐 Step 2: Enable Firebase Services

### 2.1 Enable Authentication

1. Go to: https://console.firebase.google.com/project/school-c0203/authentication
2. Click **"Get Started"**
3. Enable these sign-in methods:
   - ✅ **Google** (Add support email)
   - ✅ **Email/Password**

### 2.2 Enable Firestore Database

1. Go to: https://console.firebase.google.com/project/school-c0203/firestore
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add rules)
4. Choose location: **asia-south1** (Mumbai)
5. Click **"Enable"**

### 2.3 Update Firestore Security Rules

1. Go to Firestore → **Rules** tab
2. Replace with this content:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approvalStatus == 'approved';
    }

    // Helper function to check if user is teacher
    function isTeacher() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approvalStatus == 'approved';
    }

    // Helper function to check if user is approved
    function isApproved() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approvalStatus == 'approved';
    }

    // Users collection
    match /users/{userId} {
      // Anyone can read user profiles
      allow read: if true;

      // Anyone can create their own profile
      allow create: if request.auth != null && request.auth.uid == userId;

      // Users can update their own profile, admins can update any
      allow update: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());

      // Only admins can delete
      allow delete: if isAdmin();
    }

    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if isApproved();
      allow create: if isTeacher() || isAdmin();
      allow update: if isTeacher() || isAdmin();
      allow delete: if isAdmin();
    }

    // Fee payments collection
    match /fee_payments/{paymentId} {
      allow read: if isApproved();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Children collection
    match /children/{childId} {
      allow read: if isApproved();
      allow create, update, delete: if isAdmin();
    }

    // Classes collection
    match /classes/{classId} {
      allow read: if isApproved();
      allow create, update, delete: if isAdmin();
    }
  }
}
```

3. Click **"Publish"**

---

## 📊 Step 3: Seed Database with Initial Data

### 3.1 Create Firebase Admin Script

Create file: `seed-database.js`

```javascript
// This script seeds your Firebase database with initial data
// Run: node seed-database.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  console.log('Starting database seeding...');

  // Add initial admin user
  await db.collection('users').doc('admin-1').set({
    email: 'admin@mayuri.com',
    name: 'School Admin',
    role: 'admin',
    phone: '+91 98765 43210',
    approvalStatus: 'approved',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Add classes
  await db.collection('classes').doc('class-1').set({
    name: 'Sunshine Nursery',
    ageGroup: '2-3 years',
    teacherId: 'teacher-1',
    capacity: 15,
    currentStrength: 0
  });

  // Add fee structure
  await db.collection('fee_structures').doc('monthly-fee').set({
    name: 'Monthly Tuition Fee',
    amount: 3500,
    frequency: 'monthly',
    applicableClasses: ['class-1', 'class-2', 'class-3']
  });

  console.log('Database seeded successfully!');
  process.exit(0);
}

seedDatabase().catch(console.error);
```

### 3.2 Get Service Account Key

1. Go to: https://console.firebase.google.com/project/school-c0203/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Save as `serviceAccountKey.json` in project root
4. **⚠️ Add to .gitignore** (never commit this!)

### 3.3 Run Seeding Script

```bash
npm install firebase-admin
node seed-database.js
```

---

## 🏗️ Step 4: Build for Production

### 4.1 Update Environment Variables

Ensure `.env` has correct Firebase config (already set):
```env
VITE_FIREBASE_API_KEY=AIzaSyBktAXNzw4AIb2oeqUS41poSbnH45qR940
VITE_FIREBASE_AUTH_DOMAIN=school-c0203.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=school-c0203
VITE_FIREBASE_STORAGE_BUCKET=school-c0203.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=910785587784
VITE_FIREBASE_APP_ID=1:910785587784:web:3875a96ee99fc7667bc67d
```

### 4.2 Build the App

```bash
npm run build
```

This creates optimized production files in the `dist/` folder.

### 4.3 Test Production Build Locally

```bash
npm run preview
```

Open: http://localhost:4173/

---

## 🚀 Step 5: Deploy to Firebase Hosting

### 5.1 Deploy

```bash
firebase deploy
```

This deploys:
- ✅ Firestore rules
- ✅ Hosting (your app)

### 5.2 Your Live URL

After deployment, you'll get a URL like:
```
https://school-c0203.web.app
```

or

```
https://school-c0203.firebaseapp.com
```

---

## 🔄 Step 6: Continuous Deployment

### 6.1 GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

    - name: Deploy to Firebase
      uses: w9jds/firebase-action@master
      with:
        args: deploy --only hosting
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### 6.2 Get Firebase Token

```bash
firebase login:ci
```

Copy the token and add to GitHub Secrets.

---

## 🔐 Step 7: Security & Production Setup

### 7.1 Enable App Check (Prevent API Abuse)

1. Go to: https://console.firebase.google.com/project/school-c0203/appcheck
2. Click **"Get Started"**
3. Register your web app
4. Use **reCAPTCHA v3**

### 7.2 Set Up Custom Domain (Optional)

1. Go to Firebase Hosting → Custom domain
2. Add your domain (e.g., `mayuri.school`)
3. Follow DNS setup instructions

### 7.3 Enable Analytics

1. Go to: https://console.firebase.google.com/project/school-c0203/analytics
2. Click **"Enable Google Analytics"**

---

## 📱 Step 8: Testing Production App

### 8.1 Test Authentication

1. Visit your deployed URL
2. Sign in with Google
3. Check Firebase Console → Authentication → Users

### 8.2 Test Admin Features

1. Login as admin (use seeded admin account)
2. Create a new user
3. Approve the user
4. Check Firestore → users collection

### 8.3 Test Fee Analytics

1. Login as admin
2. Go to Fee Analytics
3. Add some fee payments via Firestore Console
4. Verify data shows correctly

---

## 🔄 Step 9: Updates & Redeployment

When you make changes:

```bash
# 1. Make your changes
# 2. Test locally
npm run dev

# 3. Build
npm run build

# 4. Test production build
npm run preview

# 5. Deploy
firebase deploy
```

---

## 📊 Step 10: Monitoring

### 10.1 Firebase Console

Monitor:
- **Authentication**: User sign-ups
- **Firestore**: Database usage
- **Hosting**: Traffic & bandwidth
- **Analytics**: User behavior

### 10.2 Set Up Billing Alerts

1. Go to: https://console.firebase.google.com/project/school-c0203/usage
2. Set up budget alerts
3. Monitor free tier limits

---

## 🆘 Troubleshooting

### Issue: "Permission denied" errors

**Solution**: Check Firestore security rules

### Issue: Authentication not working

**Solution**:
1. Check `.env` variables
2. Verify domain is authorized in Firebase Console
3. Add deployed URL to authorized domains

### Issue: Build fails

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Slow loading

**Solution**: Enable caching in `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "headers": [{
      "source": "**/*.@(js|css)",
      "headers": [{
        "key": "Cache-Control",
        "value": "max-age=31536000"
      }]
    }]
  }
}
```

---

## ✅ Post-Deployment Checklist

- [ ] Firebase services enabled (Auth, Firestore)
- [ ] Security rules configured
- [ ] Database seeded with initial data
- [ ] App deployed to Firebase Hosting
- [ ] Authentication tested
- [ ] Admin features tested
- [ ] Custom domain added (optional)
- [ ] App Check enabled
- [ ] Analytics enabled
- [ ] Billing alerts set up
- [ ] Documentation updated with live URL

---

## 🌐 Your Deployed App

**Live URL**: `https://school-c0203.web.app`

**Firebase Console**: https://console.firebase.google.com/project/school-c0203

**Admin Panel**: Login with `admin@mayuri.com` (after seeding DB)

---

## 📝 Quick Commands Reference

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init

# Build
npm run build

# Deploy
firebase deploy

# Deploy hosting only
firebase deploy --only hosting

# Deploy rules only
firebase deploy --only firestore:rules

# View logs
firebase functions:log

# Open hosting URL
firebase open hosting:site
```

---

## 🎯 Next Steps After Deployment

1. **Add Real Students**: Go to admin panel, create students
2. **Create Teachers**: Use "Create User" feature
3. **Set Up Fee Payments**: Add fee structures
4. **Configure GPay**: Update UPI ID for production
5. **Train Staff**: Share app URL and user guide
6. **Monitor Usage**: Check Firebase Console daily
7. **Backup Data**: Set up automated backups

---

**Your app is now live!** 🎉

Share the URL with parents and teachers to start using the app.
