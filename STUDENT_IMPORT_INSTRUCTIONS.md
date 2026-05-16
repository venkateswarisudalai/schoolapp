# Student Data Collection — Instructions for Mayuri Kids Villa

Hi! Please fill in the attached **student_import_template.csv** with the details of each student. One row per student. Open it in Excel or Google Sheets — both work.

## Required columns (must be filled)

| Column | What to enter | Example |
|---|---|---|
| Student Name | Full name of the child | Aarav Kumar |
| Parent Name | Primary parent / guardian name | Priya Kumar |
| Parent Email | A real Gmail / email — parents will log in with this | priya.kumar@gmail.com |
| Parent Phone | 10-digit mobile (with country code optional) | +91 9876543210 |
| Class | One of: `prekg`, `lkg`, `ukg` (lowercase) | prekg |
| Date of Birth | Format `YYYY-MM-DD` | 2022-03-15 |
| Gender | `male` or `female` (lowercase) | female |
| Admission Date | When child joined — format `YYYY-MM-DD` | 2026-06-01 |

## Optional columns (leave blank if not known)

| Column | Notes |
|---|---|
| Parent Password | Defaults to `Parent@123` if blank. Share this with the parent for their first login. |
| Address | Full home address |
| Emergency Contact | A second phone number to call in emergencies |
| Medical Info | Allergies, conditions, medication — anything important |

## Columns to LEAVE BLANK

- **Student Username** and **Student Password** — these are unused. The app generates the admission number (`mkp-prekg-01`, `mkp-lkg-25` etc.) automatically when you import.

## How to share the data back

1. Save the file as CSV (in Excel: File → Save As → CSV (Comma delimited) `.csv`).
2. Send it back to the admin.
3. Admin opens the app → **Import Students** → uploads the file.

## After import, what happens

For each row, the app will:
1. Create the student record and auto-assign a unique admission number (e.g. `mkp-prekg-04`).
2. Create the parent's login using their email.
3. Show a success report with each student listed.

The admin can share each parent's login (email + password) with them so they can access the parent app.

## Common mistakes to avoid

- Don't use Indian date formats like `15/03/2022` — must be `2022-03-15`.
- Don't write "Pre-KG" or "Nursery" — must be exactly `prekg` (lowercase, no hyphen).
- Don't leave Parent Email blank — that's how parents log in.
- Two children of the same parent: enter the **same Parent Email** on both rows. The app will recognize them as siblings.

If a row fails to import, the app will show you exactly which row and why — you can fix and re-upload only that row.
