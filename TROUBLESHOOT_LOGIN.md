# Troubleshoot Login Issue

## The app is stuck on "Loading..." screen

This happens when:
1. User exists in Firebase Authentication ✓
2. But Firestore document is missing OR has wrong data ✗

## Quick Fix - Check Browser Console

1. Open your app: https://school-c0203.web.app
2. Press **F12** or **Right-click → Inspect**
3. Click **Console** tab
4. Look for RED error messages
5. Send me a screenshot or copy the error

Common errors:
- "Missing or insufficient permissions" → Firestore document issue
- "User not found" → Firestore document missing
- "approvalStatus: pending" → User not approved

## Let's verify the Firestore document exists

Your User ID: `8Nz4mTygXYPoRccyjfcyAYpMeJC2`

### Check Firestore:
https://console.firebase.google.com/project/school-c0203/firestore/data/~2Fusers~2F8Nz4mTygXYPoRccyjfcyAYpMeJC2

**The document MUST have these exact fields:**

```
email: "venki10march@gmail.com"
name: "Vignesh - School Administrator"
role: "admin"
approvalStatus: "approved"
phone: "+91 9876543210"
```

## If document is missing:

1. Go to: https://console.firebase.google.com/project/school-c0203/firestore/data/~2Fusers
2. Click "Add document"
3. Document ID: `8Nz4mTygXYPoRccyjfcyAYpMeJC2` (copy exactly)
4. Add ALL 5 fields above
5. Click Save

## If document exists but has wrong values:

1. Click on the document
2. Click "Edit"
3. Make sure:
   - `role` = `admin` (not "parent" or "teacher")
   - `approvalStatus` = `approved` (not "pending")
4. Click Save

## After fixing, try login again:

1. Go to: https://school-c0203.web.app
2. Click "Sign in with Email"
3. Email: venki10march@gmail.com
4. Password: (the one you set in Firebase Auth)
5. Click Sign In

It should take you to Admin Dashboard immediately.

## Still stuck?

The app checks:
1. User authenticated? ✓
2. User document in Firestore? ?
3. role = "admin"? ?
4. approvalStatus = "approved"? ?

If any of 2-4 are false, you get stuck loading.

Check browser console (F12) for exact error message.
