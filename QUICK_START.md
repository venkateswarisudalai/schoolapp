# 🚀 Quick Start Guide - Mayuri School App

## Your App is LIVE!

**URL:** https://school-c0203.web.app

---

## Step 1: Create Admin Account (5 minutes)

### A. Create User in Firebase Authentication

1. Open: https://console.firebase.google.com/project/school-c0203/authentication/users
2. Click "Add user"
3. Email: `admin@mayurischool.com` (or your school email)
4. Password: Create a strong password (save it!)
5. Click "Add user"
6. **COPY THE USER UID** (looks like `xYz123AbC456...`)

### B. Add Admin Role in Firestore

1. Open: https://console.firebase.google.com/project/school-c0203/firestore/data
2. Click "Start collection" → Collection ID: `users` → Next
3. Document ID: **Paste the UID from Step A**
4. Add fields:
   - `email` (string): `admin@mayurischool.com`
   - `name` (string): `School Administrator`
   - `role` (string): `admin`
   - `approvalStatus` (string): `approved`
   - `phone` (string): `+91 9876543210`
   - `createdAt` (timestamp): Click calendar icon → Use current time
5. Click "Save"

### C. Test Login

1. Go to: https://school-c0203.web.app
2. Click "Sign in with Email"
3. Enter admin email and password
4. You should see the Admin Dashboard!

---

## Step 2: Create Your First Teacher (2 minutes)

1. From Admin Dashboard, click "Create User"
2. Fill in:
   - Name: Teacher's name
   - Email: Teacher's email
   - Password: Temporary password (teacher can change later)
   - Role: Select "Teacher"
   - Phone: Teacher's phone
3. Click "Create User"
4. Share credentials with the teacher

---

## Step 3: Create Your First Student (3 minutes)

1. From Admin Dashboard, click "Create Student"
2. Fill in **Student Information:**
   - Student Name
   - Date of Birth
   - Gender
   - Class (Nursery/LKG/UKG)
   - Admission Date
3. Fill in **Parent Information:**
   - Parent Name
   - Parent Email (for login)
   - Parent Phone
4. Fill in **Additional Information:**
   - Address
   - Emergency Contact
   - Medical Info (optional)
5. Click "Create Student"
6. Parent account is created automatically!
7. Share credentials with the parent

---

## Step 4: Test Everything (5 minutes)

### Test Teacher Login:
1. Open app in incognito/private window
2. Login with teacher credentials
3. Try marking attendance
4. Try adding activities

### Test Parent Login:
1. Open app in another incognito window
2. Login with parent credentials
3. View child's attendance
4. View activities
5. Check fees

---

## Common Tasks

### How to Create More Teachers:
Admin Dashboard → Create User → Fill details → Select "Teacher" role

### How to Create More Students:
Admin Dashboard → Create Student → Fill student & parent details

### How to Approve Users:
Admin Dashboard → Approvals → Approve/Reject pending users

### How to View Analytics:
Admin Dashboard → Fee Analytics → View charts and stats

### How to Mark Attendance (Teachers):
Teacher Dashboard → Mark Attendance → Select date → Mark students → Save

### How to Pay Fees (Parents):
Parent Dashboard → Fees → Select payment → Pay

---

## Important Links

**Live App:** https://school-c0203.web.app

**Firebase Console:** https://console.firebase.google.com/project/school-c0203

**Authentication (Users):** https://console.firebase.google.com/project/school-c0203/authentication/users

**Firestore (Database):** https://console.firebase.google.com/project/school-c0203/firestore/data

---

## Features Available

### Admin Features:
- Create teachers and students
- Approve new users
- View all attendance
- Manage fees
- View analytics
- Generate reports
- Manage classes

### Teacher Features:
- Mark daily attendance
- Add daily activities
- View students
- Send messages
- View class information

### Parent Features:
- View child's attendance
- See daily activities
- Pay fees
- View child's information
- Receive announcements

---

## Security

- All data is encrypted
- Role-based access control
- Admin approval required for new users
- Secure Firebase authentication
- HTTPS only

---

## Monthly Fee Structure

Default: ₹3,500 per student per month

You can customize this in the admin panel.

---

## Need Help?

1. Check `DEPLOYMENT_COMPLETE.md` for detailed instructions
2. Check Firebase Console for errors
3. Check browser console (F12) for errors
4. Ensure internet connection is stable

---

## Next Steps

1. ✅ Create admin account
2. ✅ Create first teacher
3. ✅ Create first student
4. Test all features
5. Share URL with school staff
6. Start using the app daily!

---

**Good luck with your school management! 🎉**
