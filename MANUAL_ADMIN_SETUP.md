# Create Admin Account - Manual Steps

Follow these exact steps to create your admin account:

## Step 1: Open Firebase Authentication

Click this link:
```
https://console.firebase.google.com/project/school-c0203/authentication/users
```

Or manually:
1. Go to https://console.firebase.google.com
2. Click on "school-c0203" project
3. Click "Authentication" in left menu
4. Click "Users" tab

## Step 2: Add New User

1. Click the **"Add user"** button (top right)

2. Fill in:
   - **Email**: `venki10march@gmail.com`
   - **Password**: `MayuriAdmin@2026`
   - Click **"Add user"**

3. **IMPORTANT**: After user is created, you'll see a list of users. Find the user you just created and **COPY THE USER UID** (it looks like: `xYz123AbC456DeF789`)

   Example: `vKp9TxMnQRe8HsLdFgJk2WzYbN1`

## Step 3: Open Firestore Database

Click this link:
```
https://console.firebase.google.com/project/school-c0203/firestore/data
```

Or manually:
1. In Firebase Console
2. Click "Firestore Database" in left menu
3. Click "Data" tab

## Step 4: Create Admin Document

1. If this is your first time:
   - Click **"Start collection"**
   - Collection ID: `users`
   - Click **"Next"**

2. If `users` collection already exists:
   - Click on `users` collection
   - Click **"Add document"**

3. **Document ID**: Paste the UID you copied in Step 2
   - Example: `vKp9TxMnQRe8HsLdFgJk2WzYbN1`

4. Add these fields (click "+ Add field" for each):

   | Field Name | Type | Value |
   |------------|------|-------|
   | `email` | string | `venki10march@gmail.com` |
   | `name` | string | `Vignesh - School Administrator` |
   | `role` | string | `admin` |
   | `approvalStatus` | string | `approved` |
   | `phone` | string | `+91 9876543210` |
   | `createdAt` | timestamp | (click calendar icon, select "Use current time") |

5. Click **"Save"**

## Step 5: Test Login

1. Go to your app: https://school-c0203.web.app

2. Click **"Sign in with Email"**

3. Enter:
   - Email: `venki10march@gmail.com`
   - Password: `MayuriAdmin@2026`

4. Click **"Sign In"**

5. You should see the **Admin Dashboard** with all features!

---

## Credentials Summary

**Admin Email**: `venki10march@gmail.com`
**Password**: `MayuriAdmin@2026`
**Role**: Admin
**App URL**: https://school-c0203.web.app

---

## Troubleshooting

### Can't see "Add user" button?
- Make sure you're logged into the correct Google account
- Make sure you have owner/editor permissions on the Firebase project

### "Permission denied" error?
- You need to be the owner of the Firebase project
- Check your account permissions in Project Settings

### User created but can't login?
- Make sure you created the Firestore document in Step 4
- Check that the Document ID matches the User UID exactly
- Check that `role` is `admin` and `approvalStatus` is `approved`

### Still having issues?
1. Open browser console (F12)
2. Try to login
3. Check for error messages
4. Send me the error message

---

**After successful login, you can:**
- Create teachers
- Create students
- Manage the school app
- Change your password in settings
