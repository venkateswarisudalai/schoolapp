# Production Setup Guide - Mayuri School App

## 🔒 Secure Production Configuration

This guide sets up a production-ready school management system with:
- ✅ Single admin account (no demo mode)
- ✅ Admin creates all teachers and students
- ✅ Secure role-based access
- ✅ Proper authentication flow

---

## 🚀 Initial Setup - Create Admin Account

### Step 1: Deploy to Firebase

```bash
cd ~/Documents/schoolapp/mayuri
firebase login
npm run build
firebase deploy
```

### Step 2: Create Your Admin Account

**Option A: Using Firebase Console (Recommended)**

1. Go to Firebase Console:
   ```
   https://console.firebase.google.com/project/school-c0203/authentication
   ```

2. Click "Add user"

3. Enter admin credentials:
   ```
   Email: admin@mayurischool.com
   Password: [Choose a strong password]
   ```

4. Click "Add user"

5. Copy the User UID (you'll need this)

**Option B: Using Firebase CLI**

```bash
# This requires setting up Firebase Admin SDK
# See below for script
```

### Step 3: Set Admin Role in Firestore

1. Go to Firestore Database:
   ```
   https://console.firebase.google.com/project/school-c0203/firestore
   ```

2. Click "Start collection"

3. Collection ID: `users`

4. Document ID: [Paste the User UID from Step 2]

5. Add fields:
   ```
   email: admin@mayurischool.com
   name: School Administrator
   role: admin
   approvalStatus: approved
   createdAt: [current timestamp]
   ```

6. Click "Save"

---

## 🔐 Admin Login Credentials

**Save these securely!**

```
Email: admin@mayurischool.com
Password: [Your chosen password]
Role: admin
```

**Important:** Change the email and password to your own!

---

## 👥 Creating Teachers (Admin Only)

After logging in as admin:

1. Click "Create User" from dashboard
2. Select "Teacher"
3. Fill in details:
   - Name
   - Email
   - Password (temporary)
   - Phone
   - Qualification
   - Salary
4. Click "Create Teacher"

Teacher will receive their credentials and can login.

---

## 👶 Creating Students (Admin Only)

After logging in as admin:

1. Click "Create Student" from dashboard
2. Fill in details:
   - Student Name
   - Parent Name
   - Parent Email
   - Parent Phone
   - Class
   - Date of Birth
   - Address
3. Click "Create Student"

Parent will be created automatically and can login with their email.

---

## 🔒 Security Rules

Your Firestore security rules enforce:

```javascript
// Only approved admins can:
- Create users (teachers, students, parents)
- Delete users
- Update user roles
- Modify fees

// Approved teachers can:
- Mark attendance
- View students
- Add activities

// Approved parents can:
- View their own child's data
- Make fee payments
- Send messages
```

---

## 🚫 Removed Features (For Production)

- ❌ Demo login mode
- ❌ Public user registration
- ❌ Self-approval
- ❌ Mock data

---

## ✅ Production Features

- ✅ Single admin account
- ✅ Admin-only user creation
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Approval workflow
- ✅ Real Firebase database
- ✅ Audit logs

---

## 📋 Post-Deployment Checklist

- [ ] Admin account created
- [ ] Admin can login successfully
- [ ] Demo login removed
- [ ] Firestore rules deployed
- [ ] Authentication enabled
- [ ] Test teacher creation
- [ ] Test student creation
- [ ] Test parent login
- [ ] Test fee payment
- [ ] Test attendance marking

---

## 🔄 Daily Operations

### As Admin:
1. Login with your admin credentials
2. Create teachers as needed
3. Create students and parents
4. Approve any pending users
5. Manage fees and payments
6. View analytics

### As Teacher:
1. Login with credentials from admin
2. Mark daily attendance
3. Add activities
4. View students
5. Send messages to parents

### As Parent:
1. Login with credentials from admin
2. View child's attendance
3. See daily activities
4. Pay fees
5. View announcements

---

## 🆘 Troubleshooting

### Can't login as admin

1. Check email/password are correct
2. Verify user exists in Firebase Authentication
3. Check Firestore has user document with role: 'admin'
4. Check approvalStatus is 'approved'

### Can't create users

1. Verify you're logged in as admin
2. Check Firestore rules are deployed
3. Check console for errors

### Parent can't see their child

1. Check parent's childId matches student's ID
2. Verify parent has approvalStatus: 'approved'
3. Check Firestore rules

---

## 🔐 Security Best Practices

1. **Strong Admin Password**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Change every 90 days

2. **Admin Account Protection**
   - Never share admin credentials
   - Use 2FA (enable in Firebase Console)
   - Log out after each session

3. **Teacher Credentials**
   - Give temporary passwords
   - Ask teachers to change on first login
   - Disable accounts for teachers who leave

4. **Data Backup**
   - Firebase auto-backs up data
   - Export important data monthly
   - Keep offline backup

---

## 📞 Support

If you need help:
1. Check Firebase Console logs
2. Check browser console for errors
3. Review Firestore security rules
4. Test with different user roles

---

## 🎯 Next Steps

1. Deploy to production
2. Create admin account
3. Test admin login
4. Create first teacher
5. Create first student
6. Share app URL with staff

**Production URL:** https://school-c0203.web.app

---

**Setup Complete! Your school app is production-ready! 🎉**
