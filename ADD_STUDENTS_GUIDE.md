# Adding Students to Mayuri School App

## Current Situation
The app is deployed at https://school-c0203.web.app, but there's no student data yet.

## Best Method: Use the Admin Panel

### Step 1: Login as Admin
1. Go to https://school-c0203.web.app
2. Use the admin credentials:
   - Email: `venki10march@gmail.com`
   - Password: `MayuriAdmin@2026`

### Step 2: Create Students
Once logged in as admin, click the **"Create Student"** button and fill in the details for each student:

#### Student 1: Aarav Sharma
```
Student Name: Aarav Sharma
Parent Name: Rajesh Sharma
Parent Email: rajesh.sharma@example.com
Parent Phone: +91 9876543210
Class: Nursery
Date of Birth: 2021-03-15
Gender: Male
Address: 123 MG Road, Bangalore, Karnataka 560001
Emergency Contact: +91 9876543211
Medical Info: No known allergies
```

#### Student 2: Ananya Patel
```
Student Name: Ananya Patel
Parent Name: Priya Patel
Parent Email: priya.patel@example.com
Parent Phone: +91 9876543220
Class: LKG
Date of Birth: 2020-07-22
Gender: Female
Address: 456 Brigade Road, Bangalore, Karnataka 560025
Emergency Contact: +91 9876543221
Medical Info: (leave blank)
```

#### Student 3: Arjun Kumar
```
Student Name: Arjun Kumar
Parent Name: Sunita Kumar
Parent Email: sunita.kumar@example.com
Parent Phone: +91 9876543230
Class: UKG
Date of Birth: 2019-11-08
Gender: Male
Address: 789 Indiranagar, Bangalore, Karnataka 560038
Emergency Contact: +91 9876543231
Medical Info: Lactose intolerant
```

### Step 3: Save Parent Credentials
After creating each student, the admin panel will show the auto-generated password.
**Save these credentials** (default password is usually `Parent@123`):

- `rajesh.sharma@example.com` / `Parent@123`
- `priya.patel@example.com` / `Parent@123`
- `sunita.kumar@example.com` / `Parent@123`

### Step 4: Test Parent Login
Logout from admin account and test logging in as one of the parents to verify everything works.

---

## Alternative Method: Firebase Console (Manual)

If the admin panel doesn't work for creating students, you can add them manually through Firebase Console:

### 1. Go to Firebase Console
https://console.firebase.google.com/project/school-c0203

### 2. Create Parent Auth Account
1. Go to **Authentication** → **Users** tab
2. Click **"Add user"**
3. Enter:
   - Email: `rajesh.sharma@example.com`
   - Password: `Parent@123`
4. Click **"Add user"**
5. **Copy the User UID** (e.g., `abc123xyz...`)

### 3. Create Student in Firestore
1. Go to **Firestore Database** → **Data** tab
2. Click on **`children`** collection (or create it)
3. Click **"Add document"**
4. Use auto-generated ID or create custom ID like `student_001`
5. Add fields:
```
name: "Aarav Sharma"
parentId: "abc123xyz..." (the UID from step 2)
classId: "nursery"
dateOfBirth: "2021-03-15"
gender: "male"
address: "123 MG Road, Bangalore, Karnataka 560001"
emergencyContact: "+91 9876543211"
medicalInfo: "No known allergies"
admissionDate: "2024-01-15"
createdAt: (timestamp - use "Add field" → type: timestamp)
```

### 4. Create Parent User Document
1. Go to **`users`** collection
2. Click **"Add document"**
3. Use the **same UID from step 2** as the document ID
4. Add fields:
```
email: "rajesh.sharma@example.com"
name: "Rajesh Sharma"
role: "parent"
phone: "+91 9876543210"
approvalStatus: "approved"
childId: "student_001" (the student ID from step 3)
createdAt: (timestamp)
updatedAt: (timestamp)
```

### 5. Repeat for Other Students
Follow steps 2-4 for Ananya Patel and Arjun Kumar.

---

## Verifying the Setup

After adding students:

1. **Login as Parent**:
   - Go to https://school-c0203.web.app
   - Email: `rajesh.sharma@example.com`
   - Password: `Parent@123`

2. **You should see**:
   - Student card with "Aarav Sharma - Nursery"
   - Today's activities section
   - Quick action buttons (Attendance, Updates, etc.)

3. **If you see "No students data found"**:
   - Check that `childId` in parent's user document matches the student's document ID
   - Check that `parentId` in student's document matches the parent's UID

---

## Why Scripts Didn't Work

The automated scripts failed because:
1. Admin credentials were incorrect/not found
2. Firebase Admin SDK requires service account key file
3. Security rules prevent client-side scripts from writing to Firestore

The **Admin Panel** is the recommended way to add students - it's built into the app and handles all the linking automatically.

---

## Need Help?

If you encounter issues:
1. Check Firebase Console → Authentication → Users (verify parent accounts exist)
2. Check Firebase Console → Firestore → `children` collection (verify student documents)
3. Check Firebase Console → Firestore → `users` collection (verify linking is correct)
