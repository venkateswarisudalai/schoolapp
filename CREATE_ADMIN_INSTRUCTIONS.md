# Step-by-Step Instructions to Create Admin Document

## You MUST create the Firestore document manually through Firebase Console

The app is stuck loading because the Firestore document doesn't exist yet.

---

## STEP BY STEP - DO THIS NOW:

### 1. Open Firestore Console

Click this link (or copy to browser):
```
https://console.firebase.google.com/project/school-c0203/firestore/data
```

### 2. Look at the Left Sidebar

Do you see a collection called "users"?

**If YES (users collection exists):**
- Click on "users" collection
- Go to Step 3

**If NO (users collection does NOT exist):**
- Click "Start collection" button
- Collection ID: type `users`
- Click "Next"
- Go to Step 3

### 3. Add Document

You should now be looking at the users collection (or adding first document).

Click "Add document" button (or you're already on this screen)

### 4. Fill in Document ID

**VERY IMPORTANT - Copy this EXACTLY:**
```
8Nz4mTygXYPoRccyjfcyAYpMeJC2
```

Paste it in the "Document ID" field.

### 5. Add Fields

Click "+ Add field" button to add each field below:

**Field 1:**
- Field: `email`
- Type: select "string" from dropdown
- Value: `venki10march@gmail.com`

**Field 2:**
- Field: `name`
- Type: select "string" from dropdown
- Value: `Vignesh - School Administrator`

**Field 3:**
- Field: `role`
- Type: select "string" from dropdown
- Value: `admin`

**Field 4:**
- Field: `approvalStatus`
- Type: select "string" from dropdown
- Value: `approved`

**Field 5:**
- Field: `phone`
- Type: select "string" from dropdown
- Value: `+91 9876543210`

### 6. Save

Click the blue "Save" button at the bottom

### 7. Verify

You should now see a document with ID `8Nz4mTygXYPoRccyjfcyAYpMeJC2` in the users collection.

Click on it to verify it has all 5 fields.

### 8. Test Login

1. Open new browser tab (or refresh): https://school-c0203.web.app
2. Click "Sign in with Email"
3. Email: `venki10march@gmail.com`
4. Password: (whatever password you set in Firebase Authentication)
5. Click "Sign In"

**It should work now!**

---

## Common Issues:

### "I don't see 'Add document' button"
- Make sure you clicked on the "users" collection first
- Or click "Start collection" if users doesn't exist

### "The save button is greyed out"
- Make sure you filled in Document ID: `8Nz4mTygXYPoRccyjfcyAYpMeJC2`
- Make sure you added all 5 fields
- Make sure all fields are type "string"

### "I saved it but still loading"
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Try incognito/private window
- Make sure the Document ID is EXACTLY: `8Nz4mTygXYPoRccyjfcyAYpMeJC2`

---

## What Password to Use?

The password is whatever you set when you created the user in Firebase Authentication.

If you don't remember:
1. Go to: https://console.firebase.google.com/project/school-c0203/authentication/users
2. Find user `venki10march@gmail.com`
3. Click the 3 dots (...) on the right
4. Click "Reset password"
5. Set new password: `Mayuri@2026`
6. Save

Then use that password to login.

---

Let me know once you've created the document!
