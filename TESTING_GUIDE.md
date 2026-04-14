# Mayuri Playschool App - Testing Guide

## 🚀 Quick Start

### Step 1: Start the App
```bash
cd /Users/vigneshsubbiah/Documents/schoolapp/mayuri
npm run dev
```

The app will open at: **http://localhost:5173/**

---

## 📱 Testing Scenarios

### Scenario 1: Admin Creates a Teacher Account

**Goal**: Test the complete admin workflow for creating and approving a teacher

**Steps**:

1. **Open the app** in your browser: http://localhost:5173/

2. **Login as Admin**
   - Click the **"Admin"** button under "Quick Demo Login"
   - You should see the Admin Dashboard with stats and quick actions

3. **Create a New Teacher**
   - Click the **"Create User"** quick action button (green icon with user+)
   - Fill in the form:
     ```
     User Role: Teacher
     Full Name: John Doe
     Email Address: john.doe@test.com
     Password: test123
     Phone Number: +91 98765 43210
     Qualification: B.Ed in Early Childhood
     Salary: 35000
     ```
   - Click **"Create User"**
   - ✅ You should see a success message: "User Created Successfully!"

4. **Approve the New Teacher**
   - Click **"← Back to Home"** or wait 2 seconds (auto-redirect)
   - Click **"Approvals"** quick action
   - You should see "John Doe" in the pending users list
   - Click **"Approve"** button
   - ✅ User is now approved and can login

5. **Verify Creation**
   - Check Firebase Console → Firestore Database → `users` collection
   - You should see John Doe with `approvalStatus: "approved"`

**Expected Result**: ✅ New teacher created and approved successfully

---

### Scenario 2: Teacher Marks Attendance

**Goal**: Test teacher attendance marking and Firebase save

**Steps**:

1. **Logout from Admin**
   - Click the user avatar in top-right corner
   - You'll be logged out

2. **Login as Teacher**
   - Click the **"Teacher"** button under "Quick Demo Login"
   - You should see the Teacher Dashboard with today's lesson plan

3. **Mark Attendance**
   - Click **"Mark Attendance"** quick action (first button)
   - You'll see a list of all students with their names and classes
   - For each student, click one of:
     - ✓ (Present) - green button
     - × (Absent) - red button
     - 🕐 (Late) - yellow button

   Example:
   ```
   Aarav Sharma → Click ✓ (Present)
   Ananya Singh → Click ✓ (Present)
   ```

4. **Save Attendance**
   - Click **"Save Attendance"** button at the bottom
   - ✅ You should see "Attendance Saved!" success screen
   - Auto-redirects to dashboard after 2 seconds

5. **Verify in Firebase**
   - Open Firebase Console → Firestore Database → `attendance` collection
   - You should see new attendance records with:
     ```
     childId: "child-1"
     date: "2026-01-27"
     status: "present"
     checkInTime: "14:30"
     markedBy: "teacher-1"
     ```

**Expected Result**: ✅ Attendance marked and saved to Firebase

---

### Scenario 3: Parent Pays Fees via GPay

**Goal**: Test GPay payment integration and UPI link generation

**Steps**:

1. **Logout from Teacher**
   - Click user avatar → Logout

2. **Login as Parent**
   - Click the **"Parent"** button under "Quick Demo Login"
   - You should see the Parent Dashboard with child info and today's activities

3. **View Fee Payments**
   - Click **"Fees"** quick action (4th button)
   - You'll see:
     - Total Pending amount at top (pink card)
     - List of all fee payments with status badges

4. **Check Fee Details**
   - Look for fees with **"pending"** or **"overdue"** status (yellow/red badge)
   - Example:
     ```
     Monthly Tuition Fee
     Due: 2/10/2024
     ₹5,000
     Status: pending
     ```

5. **Pay with GPay**
   - Click **"Pay with GPay"** button (colorful button with GPay colors)
   - **What happens**:
     - UPI deep link is generated
     - Format: `upi://pay?pa=mayuri@oksbi&pn=Mayuri%20Playschool&am=5000...`
     - Your phone/browser will try to open GPay app

   **If GPay app is installed**:
   - GPay opens automatically with pre-filled details:
     - Payee: Mayuri Playschool
     - UPI ID: mayuri@oksbi
     - Amount: ₹5,000
     - Note: Fee Payment for Aarav Sharma

   **If GPay is not installed**:
   - You'll see a browser prompt or error
   - This is expected behavior for UPI deep links

6. **Payment Information**
   - Scroll down to see payment info section:
     ```
     UPI ID: mayuri@oksbi
     Beneficiary: Mayuri Playschool
     Note: After payment, share transaction screenshot with admin
     ```

**Expected Result**: ✅ GPay link generated correctly (you can test on mobile with GPay installed)

---

## 🔍 Additional Testing

### Test User Approval Flow

1. **Create a user WITHOUT approving**
   - Login as Admin
   - Create User → Fill form → Submit
   - DO NOT approve

2. **Try to login as that user**
   - Use Google Sign-In or Email/Password
   - Use the email you just created
   - ✅ You should see "Pending Approval" screen
   - Message: "Your account is pending approval. Please contact admin."

### Test Real Firebase Authentication

1. **Enable Google Sign-In**
   - Make sure `.env` file has Firebase credentials
   - Click "Continue with Google"
   - Sign in with your Google account
   - ✅ You're created as a new user with "pending" status

2. **Check Firebase Console**
   - Authentication → Users → See your account
   - Firestore → users → See your user document

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" when saving attendance
**Solution**:
- Check Firebase console is configured
- Check `.env` file has correct credentials
- Check internet connection

### Issue 2: GPay doesn't open
**Solution**:
- GPay deep links only work on mobile devices with GPay app installed
- On desktop, you can copy the UPI ID manually: `mayuri@oksbi`
- Test on mobile device for full experience

### Issue 3: User not appearing in approvals
**Solution**:
- Wait a few seconds (real-time listener)
- Refresh the page
- Check Firebase Firestore → users collection → look for `approvalStatus: "pending"`

### Issue 4: Demo login not working
**Solution**:
- Clear browser cache
- Hard refresh (Cmd+Shift+R on Mac)
- Check console for errors

---

## 🎯 Feature Checklist

Use this checklist while testing:

### Admin Features
- [ ] Login as admin (demo mode)
- [ ] See admin dashboard with stats
- [ ] Create new user (Teacher)
- [ ] Create new user (Admin)
- [ ] Create new user (Parent)
- [ ] View pending approvals
- [ ] Approve a user
- [ ] Reject a user
- [ ] See user appear in approvals real-time

### Teacher Features
- [ ] Login as teacher (demo mode)
- [ ] See teacher dashboard
- [ ] View today's lesson plan
- [ ] Navigate to Mark Attendance
- [ ] Mark students as Present
- [ ] Mark students as Absent
- [ ] Mark students as Late
- [ ] Save attendance to Firebase
- [ ] See success confirmation
- [ ] View attendance in Firebase console

### Parent Features
- [ ] Login as parent (demo mode)
- [ ] See parent dashboard
- [ ] View child information
- [ ] View today's activities (meals, nap, activities)
- [ ] Navigate to Fees page
- [ ] View total pending amount
- [ ] See list of all payments
- [ ] Identify pending/paid/overdue status
- [ ] Click "Pay with GPay"
- [ ] GPay link generated correctly
- [ ] View payment information

### General Features
- [ ] Logout works
- [ ] Navigation between pages works
- [ ] Back buttons work
- [ ] UI is responsive
- [ ] No console errors
- [ ] Firebase real-time updates work

---

## 📊 Firebase Verification

After testing, verify data in Firebase Console:

### 1. Authentication
```
Firebase Console → Authentication → Users
- Should see all created users
```

### 2. Firestore - Users Collection
```
Firebase Console → Firestore → users
- Check user documents
- Verify approvalStatus field
- Verify roles (teacher/admin/parent)
```

### 3. Firestore - Attendance Collection
```
Firebase Console → Firestore → attendance
- Check attendance records
- Verify date, status, childId
- Verify markedBy field
```

### 4. Firestore - Fee Payments (Optional)
```
Firebase Console → Firestore → fee_payments
- Check if collection exists
- Verify payment records if any saved
```

---

## 🎥 Video Recording for Testing

If you want to record your testing session:

1. **Mac**: Use QuickTime Screen Recording
   - Open QuickTime Player
   - File → New Screen Recording
   - Click record → Select area
   - Test the app
   - Stop recording

2. **Chrome**: Use browser's screen recording
   - Open Developer Tools (F12)
   - Click "..." → More tools → Rendering
   - Enable "Screen capture"

---

## 📝 Test Report Template

After testing, document your findings:

```markdown
## Test Report - Mayuri Playschool App

**Date**: [Date]
**Tester**: [Your Name]
**Browser**: [Chrome/Safari/Firefox]
**Device**: [MacBook/iPhone/iPad]

### Scenario 1: Admin Creates Teacher
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

### Scenario 2: Teacher Marks Attendance
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

### Scenario 3: Parent Pays Fees
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

### Issues Found
1. [Describe issue]
2. [Describe issue]

### Overall Impression
[Your feedback]
```

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check Browser Console**
   - Right-click → Inspect → Console tab
   - Look for red error messages

2. **Check Firebase Console**
   - Verify data is being saved
   - Check Authentication is working

3. **Check Network Tab**
   - Right-click → Inspect → Network tab
   - Look for failed API requests

4. **Clear Everything and Start Fresh**
   ```bash
   # Clear browser cache
   # Hard refresh (Cmd+Shift+R)

   # Restart dev server
   cd /Users/vigneshsubbiah/Documents/schoolapp/mayuri
   npm run dev
   ```

---

**Happy Testing! 🎉**

If you find any bugs or have suggestions, document them for improvement.
