# Quick Testing Guide - Mayuri App

## 🚀 **START HERE**

Your app is running at: **http://localhost:5173/**

---

## ✅ **Test 1: Login as Admin (1 minute)**

### What You'll Test
- Admin can login
- Admin dashboard shows correctly

### Steps
1. **Open** http://localhost:5173/ in your browser
2. You'll see the login screen with a flower logo 🌸
3. **Click the "Admin" button** (under "Quick Demo Login")
4. ✅ **You should see**:
   - "Admin Dashboard" at the top
   - 4 colored stat cards showing:
     - Total Students: 2
     - Present Today: 1
     - Pending Fees: 2
     - Staff Members: 2
   - 8 quick action buttons including "Create User" and "Approvals"

### ❌ If it doesn't work:
- Refresh the page (Cmd+R or Ctrl+R)
- Check browser console (F12) for errors

---

## ✅ **Test 2: Create a New Teacher (3 minutes)**

### What You'll Test
- Admin can create new users
- Form validation works
- Success message appears

### Steps
1. **Make sure you're logged in as Admin** (from Test 1)
2. **Click "Create User"** button (green button with user+ icon, first button)
3. You'll see a form titled "Create New User"
4. **Fill in the form**:
   ```
   User Role: Teacher (select from dropdown)
   Full Name: Sarah Johnson
   Email Address: sarah.test@school.com
   Password: test123456
   Phone Number: +91 98765 43210
   Qualification: M.Ed in Early Childhood
   Salary: 40000
   ```
5. **Click "Create User"** button at the bottom
6. ✅ **You should see**:
   - Green circle with ✓ checkmark
   - "User Created Successfully!"
   - Message about approving the user

### What Just Happened
- New user account created in Firebase Authentication
- User profile created in Firestore database with "pending" status
- User needs admin approval before they can login

### ❌ If it doesn't work:
- **Error: "Email already in use"** → Use a different email
- **Error: "Password too short"** → Use at least 6 characters
- **Form doesn't submit** → Check all required fields are filled

---

## ✅ **Test 3: Approve the New Teacher (2 minutes)**

### What You'll Test
- Admin can see pending users
- Admin can approve users
- Real-time updates work

### Steps
1. After creating the user, **click "← Back to Home"** or wait 2 seconds for auto-redirect
2. **Click "Approvals"** button (second button with checkmark icon)
3. ✅ **You should see**:
   - "User Approvals" page
   - "1 pending request"
   - A card showing:
     - Name: Sarah Johnson
     - Email: sarah.test@school.com
     - Role badge: "teacher"
     - "Approve" and "Reject" buttons

4. **Click "Approve"** button (green button)
5. ✅ **The user card should disappear immediately**
6. You'll see: "No pending approval requests"

### What Just Happened
- User's `approvalStatus` changed from "pending" to "approved" in Firestore
- Real-time listener updated the UI immediately
- Sarah can now login to the app

### 🔍 **Verify in Firebase Console** (Optional)
1. Go to: https://console.firebase.google.com/project/school-c0203/firestore
2. Click on "users" collection
3. Find Sarah Johnson's document
4. Check `approvalStatus: "approved"`

---

## ✅ **Test 4: Teacher Marks Attendance (3 minutes)**

### What You'll Test
- Teacher can login
- Teacher can mark attendance
- Attendance saves to Firebase

### Steps
1. **Logout from Admin**:
   - Click the user avatar in top-right corner (circle with "S")
   - You'll be logged out to login screen

2. **Login as Teacher**:
   - Click the **"Teacher"** button (under "Quick Demo Login")
   - ✅ You should see "Teacher Dashboard" at the top

3. **View Dashboard**:
   - You'll see:
     - Class card: "Sunshine Nursery • 12 students • 2-3 years"
     - "10 Present" status
     - 8 quick action buttons
     - Today's lesson plan: "Colors and Shapes"

4. **Click "Mark Attendance"** (first button with green checkmark icon)

5. **Mark Students**:
   - You'll see 2 students:
     - Aarav Sharma (👦) - Sunshine Nursery
     - Ananya Singh (👧) - Rainbow LKG

   - For Aarav Sharma:
     - **Click the ✓ (Present) button** → Button turns green

   - For Ananya Singh:
     - **Click the × (Absent) button** → Button turns red

6. **Save Attendance**:
   - **Click "Save Attendance"** button at the bottom
   - ✅ **You should see**:
     - Green circle with ✓ checkmark
     - "Attendance Saved!"
     - "Attendance has been successfully recorded."
     - Auto-redirects to dashboard after 2 seconds

### What Just Happened
- Attendance records created in Firestore `attendance` collection
- Each record includes:
  - Child ID
  - Date (today)
  - Status (present/absent)
  - Check-in time
  - Teacher ID who marked it

### 🔍 **Verify in Firebase Console**
1. Go to: https://console.firebase.google.com/project/school-c0203/firestore
2. Look for "attendance" collection (created automatically)
3. You should see 2 new documents with today's date

### ❌ If it doesn't work:
- **Error: "Network error"** → Check Firestore is enabled
- **Button not responding** → Click and wait, don't double-click
- **Not saving** → Check browser console (F12) for errors

---

## ✅ **Test 5: Parent Views & Pays Fees (3 minutes)**

### What You'll Test
- Parent can login
- Parent can view fee payments
- GPay payment link generates

### Steps
1. **Logout from Teacher**:
   - Click user avatar in top-right
   - Logout

2. **Login as Parent**:
   - Click the **"Parent"** button
   - ✅ You should see "Parent Dashboard"

3. **View Dashboard**:
   - Child card: "Aarav Sharma • Sunshine Nursery • 2-3 years"
   - Status: "Present"
   - Quick actions and today's activities

4. **Click "Fees"** (4th button with card icon)

5. **View Fee Payments**:
   - ✅ You should see:
     - Pink card at top: "Total Pending: ₹5,000"
     - List of fee payments below:

   **Payment 1**:
   ```
   Monthly Tuition Fee
   Due: 1/8/2024
   ₹5,000
   Badge: paid (green)
   Shows: "Paid on 1/8/2024" with checkmark
   Receipt: RCP-2024-001
   ```

   **Payment 2**:
   ```
   Monthly Tuition Fee
   Due: 2/10/2024
   ₹5,000
   Badge: pending (yellow)
   Button: "Pay with GPay" (colorful button)
   ```

6. **Test GPay Payment**:
   - **Click "Pay with GPay"** button on pending payment

   **What Happens**:
   - Browser/Phone tries to open GPay app
   - UPI link generated: `upi://pay?pa=mayuri@oksbi&pn=Mayuri%20Playschool&am=5000...`

   **On Mobile with GPay installed**:
   - ✅ GPay opens with pre-filled payment details:
     - Payee: Mayuri Playschool
     - UPI ID: mayuri@oksbi
     - Amount: ₹5,000
     - Note: Fee Payment for Aarav Sharma

   **On Desktop**:
   - You might see a browser prompt or nothing (expected - UPI works on mobile)

7. **View Payment Info**:
   - Scroll down to see:
   ```
   Payment Information
   UPI ID: mayuri@oksbi
   Beneficiary: Mayuri Playschool
   Note: After payment, share transaction screenshot with admin
   ```

### What Just Happened
- GPay UPI payment link generated dynamically
- Link includes school UPI ID, amount, and payment details
- Parent can complete payment in GPay app
- After payment, they share screenshot with admin for verification

### 💡 **To Test on Mobile**:
1. Make sure GPay is installed on your phone
2. Open http://localhost:5173/ on your phone (use same WiFi)
3. Or use: http://YOUR_COMPUTER_IP:5173/
4. Login as Parent → Fees → Pay with GPay
5. GPay should open automatically!

---

## ✅ **Test 6: Google Sign-In (2 minutes)**

### What You'll Test
- Real Firebase authentication
- Google OAuth works

### Prerequisites
Firebase Authentication must be enabled (see FIREBASE_SETUP.md)

### Steps
1. **Logout** if logged in
2. On login screen, **click "Continue with Google"** button
3. **Sign in with your Google account**
4. ✅ **You should**:
   - Be redirected back to app
   - See "Pending Approval" screen (yellow background)
   - Message: "Your account is pending approval. Please contact the administrator."

5. **Why Pending?**
   - New users (not in mock data) are created with "pending" status
   - Admin must approve before they can access the app

6. **Approve Yourself**:
   - Logout
   - Login as Admin (demo mode)
   - Go to Approvals
   - Find your Google account
   - Click Approve

7. **Login Again with Google**:
   - Logout
   - Continue with Google
   - ✅ Now you're in! (As a Parent by default)

### 🔍 **Verify in Firebase Console**
1. **Authentication**:
   - https://console.firebase.google.com/project/school-c0203/authentication/users
   - You should see your Google account

2. **Firestore**:
   - https://console.firebase.google.com/project/school-c0203/firestore
   - `users` collection → Find your user document
   - Check `approvalStatus: "approved"`

---

## 🎯 **Complete Feature Checklist**

Check off as you test:

### Admin Features
- [ ] Login as admin
- [ ] View dashboard stats
- [ ] Click "Create User"
- [ ] Create teacher with all fields
- [ ] See success message
- [ ] Go to Approvals
- [ ] See pending user
- [ ] Approve user
- [ ] User disappears from list

### Teacher Features
- [ ] Login as teacher
- [ ] View lesson plan
- [ ] Click "Mark Attendance"
- [ ] Mark student as Present
- [ ] Mark student as Absent
- [ ] Mark student as Late
- [ ] Click "Save Attendance"
- [ ] See success confirmation
- [ ] Verify in Firebase Console

### Parent Features
- [ ] Login as parent
- [ ] View child info
- [ ] View today's activities (meals, nap, activities)
- [ ] Click "Fees"
- [ ] See total pending amount
- [ ] View paid fee (green badge, checkmark)
- [ ] View pending fee (yellow badge)
- [ ] Click "Pay with GPay"
- [ ] GPay link generated (check URL)
- [ ] View payment information section

### Authentication
- [ ] Google Sign-In works
- [ ] New user created with "pending" status
- [ ] Pending approval screen shows
- [ ] Admin can approve the user
- [ ] User can login after approval
- [ ] Logout works

### Firebase Integration
- [ ] Check Authentication → Users
- [ ] Check Firestore → users collection
- [ ] Check Firestore → attendance collection
- [ ] Real-time updates work (Approvals page)

---

## 🐛 **Troubleshooting**

### "Cannot read properties of undefined"
- **Fix**: Refresh the page
- **Cause**: Component mounted before data loaded

### Google Sign-In doesn't work
- **Fix**: Enable Google in Firebase Console → Authentication
- **Check**: Firebase configuration in `.env` file

### Attendance not saving
- **Fix**: Enable Firestore in Firebase Console
- **Check**: Browser console for errors (F12)

### GPay button does nothing
- **Expected on Desktop**: UPI links only work on mobile with GPay installed
- **Test on Mobile**: Use your phone to test full GPay flow

### Demo login shows error
- **Fix**: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- **Clear cache**: Browser settings → Clear data

---

## 🎥 **Recording Your Test**

Want to record your testing session?

### Mac: QuickTime
```bash
1. Open QuickTime Player
2. File → New Screen Recording
3. Click Record → Select area
4. Test the app
5. Stop recording when done
```

### Chrome DevTools
```bash
1. Open DevTools (F12)
2. Click ... → More tools → Rendering
3. Enable "Screen capture"
```

---

## ✅ **Success Criteria**

Your test is successful if:

1. ✅ All 3 demo logins work (Admin, Teacher, Parent)
2. ✅ Admin can create and approve users
3. ✅ Teacher can mark and save attendance
4. ✅ Parent can view fees and GPay link generates
5. ✅ Google Sign-In works
6. ✅ Data appears in Firebase Console
7. ✅ No console errors

---

## 📱 **Next: Test on Mobile**

To test GPay on your phone:

1. Find your computer's IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. On your phone's browser, go to:
   ```
   http://YOUR_IP:5173/
   ```

3. Test the full GPay flow!

---

**Start Testing**: http://localhost:5173/

Good luck! 🚀
