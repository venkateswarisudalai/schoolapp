# Firebase Setup Guide for Mayuri Playschool App

## ✅ Current Status

Your app is **already integrated** with Firebase!

- **Project ID**: `school-c0203`
- **Firebase SDK**: v12.8.0 ✅
- **Configuration**: `.env` file configured ✅

---

## 🔧 Firebase Console Setup Required

You need to enable these services in Firebase Console:

### Step 1: Go to Firebase Console

Open: https://console.firebase.google.com/project/school-c0203

---

### Step 2: Enable Authentication

1. **Click "Authentication"** in left sidebar
2. **Click "Get Started"** (if not already enabled)
3. **Click "Sign-in method"** tab
4. **Enable these providers:**

   **a) Google Sign-In** ⭐ **REQUIRED**
   - Click "Google"
   - Toggle "Enable"
   - Add support email (your email)
   - Click "Save"

   **b) Email/Password** ⭐ **REQUIRED**
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

✅ **Result**: Users can now sign in with Google or Email/Password

---

### Step 3: Enable Firestore Database

1. **Click "Firestore Database"** in left sidebar
2. **Click "Create database"**
3. **Select "Start in test mode"** (for development)
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2026, 3, 1);
       }
     }
   }
   ```
4. **Select location**: `asia-south1` (Mumbai) or closest to you
5. **Click "Enable"**

✅ **Result**: Database ready for storing users, attendance, and fees

---

### Step 4: Set Up Firestore Collections

The app will automatically create these collections when you use features:

#### **Collections Created Automatically:**

1. **`users`** - User profiles
   ```javascript
   {
     id: "user-123",
     email: "teacher@school.com",
     name: "John Doe",
     role: "teacher",
     phone: "+91 98765 43210",
     approvalStatus: "pending",
     requestedAt: "2026-01-27T10:00:00Z"
   }
   ```

2. **`attendance`** - Attendance records
   ```javascript
   {
     id: "att-123",
     childId: "child-1",
     date: "2026-01-27",
     status: "present",
     checkInTime: "09:05",
     markedBy: "teacher-1",
     createdAt: Timestamp
   }
   ```

3. **`fee_payments`** - Fee payment tracking
   ```javascript
   {
     id: "payment-123",
     childId: "child-1",
     amount: 5000,
     dueDate: "2026-02-10",
     status: "pending",
     createdAt: Timestamp
   }
   ```

---

### Step 5: Update Security Rules (Production)

When ready for production, update Firestore Security Rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      // Anyone can read user profiles
      allow read: if true;

      // Only authenticated users can create their own profile
      allow create: if request.auth != null && request.auth.uid == userId;

      // Users can update their own profile, admins can update any profile
      allow update: if request.auth != null &&
        (request.auth.uid == userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');

      // Only admins can delete users
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Attendance collection
    match /attendance/{attendanceId} {
      // Anyone authenticated can read attendance
      allow read: if request.auth != null;

      // Only teachers and admins can create attendance
      allow create: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');

      // Only the creator or admin can update
      allow update: if request.auth != null &&
        (resource.data.markedBy == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Fee payments collection
    match /fee_payments/{paymentId} {
      // Anyone authenticated can read their own child's payments
      allow read: if request.auth != null;

      // Only admins can create/update fee payments
      allow create, update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 🧪 Testing Firebase Integration

### Test 1: Authentication

1. **Open the app**: http://localhost:5173/
2. **Click "Continue with Google"**
3. **Sign in with your Google account**
4. **Check Firebase Console**:
   - Go to **Authentication** → **Users**
   - You should see your account listed
5. **Check Firestore**:
   - Go to **Firestore Database**
   - Look for `users` collection
   - Your user document should be there with `approvalStatus: "pending"`

✅ **Expected**: New user created in both Authentication and Firestore

---

### Test 2: User Approval

1. **Login as Admin** (demo mode)
2. **Click "Approvals"**
3. **Approve the user you just created**
4. **Check Firestore**:
   - Go to `users` collection
   - Find your user document
   - `approvalStatus` should now be `"approved"`

✅ **Expected**: Real-time update in Firestore

---

### Test 3: Attendance Saving

1. **Login as Teacher** (demo mode)
2. **Click "Mark Attendance"**
3. **Mark some students as present**
4. **Click "Save Attendance"**
5. **Check Firestore**:
   - Go to **Firestore Database**
   - Look for `attendance` collection (created automatically)
   - You should see new attendance documents

✅ **Expected**: Attendance records created in Firestore

---

### Test 4: Real-time Updates

1. **Open two browser windows**:
   - Window 1: Admin Dashboard → Approvals page
   - Window 2: Firebase Console → Firestore → users collection

2. **In Firebase Console**, manually change a user's `approvalStatus` to `"pending"`

3. **In Admin Dashboard**, watch the Approvals page
   - The user should appear immediately (no refresh needed!)

✅ **Expected**: Real-time listener working

---

## 🔍 Verify Firebase Integration

### Check Browser Console

1. Open app: http://localhost:5173/
2. Open Developer Tools: `Cmd+Option+I` (Mac) or `F12` (Windows)
3. Go to **Console** tab
4. Look for:
   ```
   ✅ No errors related to Firebase
   ✅ No "Firebase: Error" messages
   ✅ No authentication errors
   ```

### Check Network Tab

1. Open Developer Tools → **Network** tab
2. Filter by "firebase"
3. You should see:
   - `identitytoolkit.googleapis.com` (Authentication)
   - `firestore.googleapis.com` (Database)
   - Status: 200 OK

---

## 📱 Features Using Firebase

### 1. Authentication
- **Google Sign-In**: `src/contexts/AuthContext.tsx` → `signInWithGoogle()`
- **Email/Password**: `src/contexts/AuthContext.tsx` → `signInWithEmail()`
- **User Creation**: `src/contexts/AuthContext.tsx` → `signUpWithEmail()`

### 2. User Management
- **Create User**: `src/services/userService.ts` → `createOrUpdateUser()`
- **Get User**: `src/services/userService.ts` → `getUserById()`
- **Approve User**: `src/services/userService.ts` → `updateUserApprovalStatus()`
- **Real-time Listeners**: `src/services/userService.ts` → `subscribeToUser()`

### 3. Attendance
- **Save Attendance**: `src/services/attendanceService.ts` → `bulkSaveAttendance()`
- **Get Attendance**: `src/services/attendanceService.ts` → `getAttendanceByDate()`

### 4. Fee Payments
- **Save Payment**: `src/services/feeService.ts` → `saveFeePayment()`
- **Update Status**: `src/services/feeService.ts` → `updateFeePaymentStatus()`

---

## 🚨 Common Issues & Solutions

### Issue 1: "Firebase: Error (auth/operation-not-allowed)"

**Cause**: Google Sign-In not enabled in Firebase Console

**Solution**:
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Google" provider
3. Add support email
4. Save

---

### Issue 2: "Missing or insufficient permissions"

**Cause**: Firestore Security Rules are too restrictive

**Solution**:
1. Go to Firestore Database → Rules
2. Change to test mode (for development):
   ```javascript
   allow read, write: if request.time < timestamp.date(2026, 3, 1);
   ```

---

### Issue 3: "Collection not created"

**Cause**: Collections are created on first write, not automatically

**Solution**:
1. Use the feature (e.g., mark attendance)
2. Wait for the operation to complete
3. Refresh Firestore console
4. Collection should appear now

---

### Issue 4: Real-time updates not working

**Cause**: Network issues or listener not attached

**Solution**:
1. Check browser console for errors
2. Verify internet connection
3. Hard refresh the page (Cmd+Shift+R)

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Update Firestore Security Rules (remove test mode)
- [ ] Enable App Check (prevent API abuse)
- [ ] Set up Firebase Authentication quotas
- [ ] Enable Firebase Monitoring
- [ ] Review Authentication methods (remove unused)
- [ ] Set up billing alerts
- [ ] Enable 2FA for Firebase Console access
- [ ] Review user permissions regularly

---

## 📊 Firebase Console URLs

Quick access to your Firebase project:

- **Project Overview**: https://console.firebase.google.com/project/school-c0203
- **Authentication**: https://console.firebase.google.com/project/school-c0203/authentication/users
- **Firestore Database**: https://console.firebase.google.com/project/school-c0203/firestore/databases/-default-/data
- **Project Settings**: https://console.firebase.google.com/project/school-c0203/settings/general

---

## 🎯 Next Steps

1. ✅ Firebase is already integrated
2. 🔧 Enable Authentication (Google + Email/Password)
3. 🔧 Enable Firestore Database
4. 🧪 Test all features
5. 🔐 Update security rules for production
6. 🚀 Deploy!

---

## 💡 Tips

1. **Keep test mode** during development for easier debugging
2. **Use Firebase Emulator Suite** for local testing (optional)
3. **Monitor usage** in Firebase Console → Usage tab
4. **Set up billing alerts** to avoid surprises
5. **Backup Firestore data** regularly (Firestore → Import/Export)

---

**Your Firebase Project**: `school-c0203` ✅
**Status**: Integrated and ready to use! 🎉

Just need to enable services in Firebase Console and start testing!
