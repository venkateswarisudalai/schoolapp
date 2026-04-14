# Database Setup Guide - Mayuri School App

## Problem: "No students data found"

This happens when:
1. The parent account exists in Firebase Auth but has no linked children in Firestore
2. No students exist in the `children` collection

## Solution: Two Ways to Add Students

### Option 1: Use Admin Panel (Recommended)

1. Login as admin: `admin@mayurischool.com` / `Admin@123`
2. Click **"Create Student"** button
3. Fill in all details:
   - Student Name
   - Parent Name
   - Parent Email (this becomes the login email)
   - Parent Phone
   - Class (Nursery/LKG/UKG)
   - Date of Birth
   - Gender
   - Address
   - Emergency Contact
4. Click **"Create Student"**
5. Save the credentials shown (Email & Password)
6. Share credentials with the parent

**This automatically:**
- Creates parent account in Firebase Auth
- Creates parent document in Firestore `users` collection
- Creates student document in Firestore `children` collection
- Links them together with IDs

### Option 2: Manual Firebase Console Setup (If needed)

If you need to link existing parents to students manually:

#### Step A: Check Existing Data

1. Go to Firebase Console: https://console.firebase.google.com/project/school-c0203/firestore
2. Check `users` collection - find the parent user
3. Note their `uid` (document ID)

#### Step B: Create Student Document

1. Go to `children` collection
2. Click "Add Document"
3. Use auto-generated ID or custom ID like `student_123`
4. Add fields:
```
name: "Student Name"
parentId: "parent-uid-from-step-A"
classId: "nursery" or "lkg" or "ukg"
dateOfBirth: "2020-01-15"
gender: "male" or "female"
address: "Full address"
emergencyContact: "+91 9876543210"
medicalInfo: ""
admissionDate: "2024-01-15"
createdAt: (timestamp) - auto
createdBy: "admin-uid"
```

#### Step C: Update Parent Document

1. Go back to `users` collection
2. Find the parent's document
3. Click Edit
4. Add/Update field:
```
childId: "student-id-from-step-B"
```

## Database Structure

### `users` Collection
```
{
  email: "parent@example.com",
  name: "Parent Name",
  role: "parent",
  phone: "+91 9876543210",
  approvalStatus: "approved",
  childId: "student_123",  // ← Links to student
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `children` Collection
```
{
  name: "Student Name",
  parentId: "parent-uid",  // ← Links to parent
  classId: "nursery",
  dateOfBirth: "2020-01-15",
  gender: "male",
  address: "123 Main St",
  emergencyContact: "+91 9876543210",
  medicalInfo: "",
  admissionDate: "2024-01-15",
  createdAt: timestamp
}
```

## Testing the Setup

1. Login as the parent
2. You should now see:
   - Student card with name and class
   - Today's activities
   - Quick action buttons working

## Common Issues

### Issue: Parent sees "No students data found"
**Cause:** Parent's `childId` is missing or incorrect
**Fix:** Update parent document in `users` collection with correct `childId`

### Issue: Student not showing in attendance list
**Cause:** Student doesn't exist in `children` collection
**Fix:** Create student via admin panel or manually in Firestore

### Issue: Wrong parent linked to student
**Cause:** `parentId` in student document is incorrect
**Fix:** Update student document with correct `parentId`

## Quick Start - Add Sample Data

### Create First Student via Admin Panel:

1. Login: https://school-c0203.web.app
2. Email: `admin@mayurischool.com`
3. Password: `Admin@123`
4. Click "Create Student"
5. Fill form:
   ```
   Student Name: Rahul Kumar
   Parent Name: Rajesh Kumar
   Parent Email: rajesh@example.com
   Parent Phone: +91 9876543210
   Class: Nursery
   DOB: 2021-03-15
   Gender: Male
   Address: 123 MG Road, Bangalore
   Emergency: +91 9876543211
   ```
6. Click "Create Student"
7. Note the auto-generated password
8. Test by logging in as `rajesh@example.com`

## Need Help?

If you still see "No students data found":
1. Check Firebase Console → Firestore → `users` collection
2. Find your parent user document
3. Verify `childId` field exists and matches a document in `children` collection
4. Check Firebase Console → Firestore → `children` collection
5. Verify `parentId` matches the parent's document ID in `users` collection
