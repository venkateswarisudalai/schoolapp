# Simple Setup - No Google Authentication Needed

## Step 1: Create Your First Admin Account Manually

Since you can't login yet, create the first admin account through Firebase Console:

### A. Create User in Firebase Authentication

1. Go to: https://console.firebase.google.com/project/school-c0203/authentication/users
2. Click "Add user"
3. Email: `admin@mayurischool.com` (or any email you want)
4. Password: `Admin@123` (you can change this later)
5. Click "Add user"
6. **COPY THE USER UID** (example: `xYz123AbC456...`)

### B. Create Admin Document in Firestore

1. Go to: https://console.firebase.google.com/project/school-c0203/firestore/data
2. Click on "users" collection (or create it)
3. Click "Add document"
4. Document ID: **Paste the UID from Step A**
5. Add these fields:
   - `email` (string): `admin@mayurischool.com`
   - `name` (string): `School Administrator`
   - `role` (string): `admin`
   - `approvalStatus` (string): `approved`
   - `phone` (string): `+91 9876543210`
6. Click "Save"

### C. Login to Your App

1. Go to: https://school-c0203.web.app
2. Click "Sign in with Email"
3. Email: `admin@mayurischool.com`
4. Password: `Admin@123`
5. Click "Sign In"

You're now logged in as admin!

---

## Step 2: Create Teachers (From Admin Panel)

Once logged in as admin:

1. Click "Create User" button
2. Fill in:
   - **Name**: Teacher's full name
   - **Email**: teacher@example.com
   - **Password**: `Teacher@123` (temporary - they can change it)
   - **Role**: Select "Teacher"
   - **Phone**: Teacher's phone number
3. Click "Create User"
4. Share credentials with teacher:
   - Email: teacher@example.com
   - Password: Teacher@123
   - URL: https://school-c0203.web.app

---

## Step 3: Create Students (From Admin Panel)

1. Click "Create Student" button
2. Fill in:
   - **Student Name**: Child's name
   - **Parent Name**: Parent's name
   - **Parent Email**: parent@example.com (this will be login)
   - **Parent Phone**: Phone number
   - **Class**: Select class (Nursery/LKG/UKG)
   - **Other details**: DOB, address, etc.
3. Click "Create Student"
4. Share credentials with parent:
   - Email: parent@example.com
   - Password: (auto-generated, shown after creation)
   - URL: https://school-c0203.web.app

---

## How Users Can Change Password

### Option 1: Through App (Recommended)
1. Login to app
2. Click profile/settings
3. Click "Change Password"
4. Enter old password
5. Enter new password
6. Click "Save"

### Option 2: Through Firebase (If they forget)
1. On login page, click "Forgot Password?"
2. Enter email
3. Check email for reset link
4. Click link and set new password

---

## Default Passwords

For easy management, you can use these default patterns:

- **Admin**: `Admin@123`
- **Teachers**: `Teacher@123`
- **Parents**: `Parent@123`

Then tell them to change it after first login!

---

## Summary

✅ **No Google login needed**
✅ **Simple email + password**
✅ **Admin creates all accounts**
✅ **Users can change passwords**
✅ **Temporary passwords for first login**
✅ **Password reset via email**

---

## Quick Reference

**Admin Credentials** (create this first):
- Email: admin@mayurischool.com
- Password: Admin@123
- Role: admin

**App URL**: https://school-c0203.web.app

**Firebase Console**: https://console.firebase.google.com/project/school-c0203
