# Google Sheets Import Guide for Mayuri School App

## 📊 Step-by-Step Guide to Import Students from Google Sheets

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create a new spreadsheet
3. Name it "Mayuri School Students Import"

### Step 2: Set Up the Columns

Copy these **EXACT** column headers in Row 1 (A1 to N1):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Student Name | Student Username | Student Password | Parent Name | Parent Email | Parent Phone | Parent Password | Class | Date of Birth | Gender | Address | Emergency Contact | Medical Info | Admission Date |

### Step 3: Fill in Student Data

**Starting from Row 2**, fill in the student information:

#### Example Data:

| Column | Example | Rules |
|--------|---------|-------|
| **Student Name** | Aarav Kumar | Full name of the student |
| **Student Username** | aarav | Lowercase, no spaces, MUST BE UNIQUE |
| **Student Password** | Student@123 | Minimum 6 characters (or leave blank for default) |
| **Parent Name** | Priya Kumar | Full name of parent/guardian |
| **Parent Email** | priya@example.com | Valid email, MUST BE UNIQUE |
| **Parent Phone** | +91 9876543210 | Phone number with country code |
| **Parent Password** | Parent@123 | Minimum 6 characters (or leave blank for default) |
| **Class** | nursery | MUST be: nursery, lkg, or ukg (lowercase) |
| **Date of Birth** | 2021-03-15 | Format: YYYY-MM-DD |
| **Gender** | male | MUST be: male or female (lowercase) |
| **Address** | 123 Main Street, Mumbai, Maharashtra | Complete address |
| **Emergency Contact** | +91 9876543211 | Alternative phone number |
| **Medical Info** | No known allergies | Optional - allergies, conditions, etc. |
| **Admission Date** | 2024-01-01 | Format: YYYY-MM-DD |

### Step 4: Sample Google Sheet Template

Here's what your sheet should look like:

```
Row 1: Headers
A1: Student Name
B1: Student Username
C1: Student Password
D1: Parent Name
E1: Parent Email
F1: Parent Phone
G1: Parent Password
H1: Class
I1: Date of Birth
J1: Gender
K1: Address
L1: Emergency Contact
M1: Medical Info
N1: Admission Date

Row 2: Example Student 1
A2: Aarav Kumar
B2: aarav
C2: Student@123
D2: Priya Kumar
E2: priya@example.com
F2: +91 9876543210
G2: Parent@123
H2: nursery
I2: 2021-03-15
J2: male
K2: 123 Main Street, Mumbai
L2: +91 9876543211
M2: No known allergies
N2: 2024-01-01

Row 3: Example Student 2
A3: Ananya Singh
B3: ananya
C3: Student@123
D3: Neha Singh
E3: neha@example.com
F3: +91 9876543220
G3: Parent@123
H3: lkg
I3: 2020-08-22
J3: female
K3: 456 Park Avenue, Mumbai
L3: +91 9876543221
M3: Allergic to peanuts
N3: 2023-06-15
```

### Step 5: Download as CSV

1. Click **File** → **Download** → **Comma Separated Values (.csv)**
2. Save the file (e.g., "mayuri_students.csv")

### Step 6: Upload to Mayuri App

1. Login to Mayuri School App as admin
2. Click **"Import Students"** button
3. Click **"Upload CSV File"**
4. Select your downloaded CSV file
5. Wait for import to complete
6. Review the results

---

## ⚠️ Important Rules

### Required Fields (Cannot be empty):
- ✅ Student Name
- ✅ Student Username (must be unique!)
- ✅ Parent Name
- ✅ Parent Email (must be unique!)
- ✅ Class (nursery/lkg/ukg)
- ✅ Date of Birth
- ✅ Gender (male/female)
- ✅ Address
- ✅ Emergency Contact
- ✅ Admission Date

### Optional Fields:
- Medical Info (can be left empty)

### Password Defaults:
- If **Student Password** is empty → defaults to "Student@123"
- If **Parent Password** is empty → defaults to "Parent@123"

### Class Values (lowercase only):
- `nursery` - For 2-3 years
- `lkg` - For 3-4 years
- `ukg` - For 4-5 years

### Gender Values (lowercase only):
- `male`
- `female`

### Date Format:
- Use **YYYY-MM-DD** format
- Example: `2021-03-15` for March 15, 2021
- Example: `2024-01-01` for January 1, 2024

---

## 📝 Quick Template

Copy this into your Google Sheet:

```
Student Name,Student Username,Student Password,Parent Name,Parent Email,Parent Phone,Parent Password,Class,Date of Birth,Gender,Address,Emergency Contact,Medical Info,Admission Date
Aarav Kumar,aarav,Student@123,Priya Kumar,priya@example.com,+91 9876543210,Parent@123,nursery,2021-03-15,male,123 Main Street Mumbai,+91 9876543211,No allergies,2024-01-01
Ananya Singh,ananya,Student@123,Neha Singh,neha@example.com,+91 9876543220,Parent@123,lkg,2020-08-22,female,456 Park Avenue Mumbai,+91 9876543221,Allergic to peanuts,2023-06-15
Rohan Patel,rohan,Student@123,Amit Patel,amit@example.com,+91 9876543230,Parent@123,ukg,2019-05-10,male,789 Lake View Mumbai,+91 9876543231,,2022-04-01
```

---

## 🔍 Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "email-already-in-use" | Username or parent email already exists | Use different username/email |
| "Missing required fields" | Empty required columns | Fill all required fields |
| "Invalid class" | Wrong class name | Use only: nursery, lkg, or ukg |
| "Invalid gender" | Wrong gender value | Use only: male or female |
| "Invalid date format" | Wrong date format | Use YYYY-MM-DD format |
| "Password too short" | Password less than 6 chars | Use at least 6 characters |

---

## 💡 Tips for Success

1. ✅ **Test with 2-3 students first** before importing all
2. ✅ **Check for duplicate usernames** - each must be unique
3. ✅ **Check for duplicate parent emails** - each must be unique
4. ✅ **Use lowercase** for class and gender
5. ✅ **Double-check date formats** (YYYY-MM-DD)
6. ✅ **Keep parent emails valid** - they'll use them to login
7. ✅ **Save a backup** of your Google Sheet before downloading

---

## 📱 Login Credentials After Import

After successful import, each student/parent will have:

**Student Login:**
- Username: `[student_username]@mayurischool.com`
- Password: `[student_password]` (from sheet or Student@123)

**Parent Login:**
- Email: `[parent_email]` (from sheet)
- Password: `[parent_password]` (from sheet or Parent@123)

---

## 🎯 Example: Complete Import Workflow

1. **Open Google Sheets** → Create new sheet
2. **Add headers** in Row 1 (copy from above)
3. **Add student data** starting from Row 2
4. **Review data** - check for errors
5. **File → Download → CSV**
6. **Go to Mayuri App** → Login as admin
7. **Click "Import Students"**
8. **Upload CSV file**
9. **Review results** - see success/failures
10. **Done!** Students can now login

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message in the import results
2. Verify your data matches the format above
3. Test with a single student first
4. Contact admin for assistance

---

## 🔐 Security Note

- Store usernames and passwords securely
- Share credentials only with respective parents
- Parents can change their passwords after first login (feature coming soon)

