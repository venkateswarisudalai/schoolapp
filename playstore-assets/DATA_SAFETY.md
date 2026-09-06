# Play Console — Data safety answer sheet

Derived from the code on 2026-08-28, not from guesswork. Every "Yes" below has a
source file next to it. Answer the Play Console form exactly as written here; a
Data safety form that contradicts app behaviour is grounds for suspension.

Companion blocker: **App content → Privacy policy** → paste
`https://school-c0203.web.app/privacy-policy.html` (live, HTTP 200).

---

## Section 1 — Data collection and security

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** — all traffic is HTTPS to Firebase; the WebView is `cleartext: false` (`capacitor.config.ts`) |
| Do you provide a way for users to request that their data is deleted? | **Yes** → `https://school-c0203.web.app/delete-account.html` (live, HTTP 200) |
| Is your data collection independently validated against a global security standard? | **No** |

---

## Section 2 — Data types

For every type below: **Shared = No.** Nothing is transferred to a third party
for its own purposes. Firebase and EmailJS are service providers processing on
your instructions, which Play does not count as "sharing".

Nothing is "processed ephemerally" — all of it is written to Firestore or
Cloud Storage.

### Location
| Type | Collected | Required/Optional | Purposes | Source |
|---|---|---|---|---|
| Precise location | **Yes** | Optional | App functionality; Fraud prevention & security | `utils/geofence.ts`, `types/index.ts` `StaffAttendanceRecord.lat/lng` |

Staff check-in/check-out reads GPS to confirm the person is on campus, and
stores `lat`, `lng`, `accuracyMeters`, `distanceMeters` on the attendance record
as an audit trail. `ENFORCE_GEOFENCE = true`. No background tracking. Parents
and students never provide location — that's why it's Optional, not Required.

### Personal info
| Type | Collected | Required/Optional | Purposes | Source |
|---|---|---|---|---|
| Name | **Yes** | Required | App functionality; Account management | `User.name`, `Child.name`, `EmergencyContact.name` |
| Email address | **Yes** | Required | App functionality; Account management | `User.email` |
| User IDs | **Yes** | Required | App functionality; Account management | Firebase Auth uid, `Child.admissionNumber` |
| Phone number | **Yes** | Optional | App functionality | `User.phone`, `EmergencyContact.phone`, `Child.doctorPhone` |
| Other info | **Yes** | Optional | App functionality | `Child.dateOfBirth`, `.gender`, `.enrollmentDate`, attendance history, guardian relationships, `AuthorizedPickup` |

### Financial info
| Type | Collected | Required/Optional | Purposes | Source |
|---|---|---|---|---|
| Other financial info | **Yes** | Optional | App functionality | Fee amounts, due dates, payment status, receipts — `services/feeService.ts` |

No payment info type applies. Payment happens in the user's own UPI app via a
deep link (`generateGPayLink`); the app never receives card, bank, or UPI
credentials.

### Health and fitness
| Type | Collected | Required/Optional | Purposes | Source |
|---|---|---|---|---|
| Health info | **Yes** | Optional | App functionality | `Child.bloodGroup`, `.allergies`, `.medications`, `.medicalConditions`, `.doctorName`, `.doctorPhone` |

**Do not skip this one.** It is the least obvious declaration on the form and the
most damaging to get wrong. The app stores children's medical details so staff
can respond in an emergency.

### Photos and videos
| Type | Collected | Required/Optional | Purposes | Source |
|---|---|---|---|---|
| Photos | **Yes** | Optional | App functionality | `services/galleryService.ts`, `feedService.ts`, `userService.ts` (profile photos), `Child.photo` |

### Files and docs
| Type | Collected | Required/Optional | Purposes | Source |
|---|---|---|---|---|
| Files and docs | **Yes** | Optional | App functionality | `Child.documents`, student import spreadsheets |

### Messages
| Type | Collected | Required/Optional | Purposes | Source |
|---|---|---|---|---|
| Other in-app messages | **Yes** | Optional | App functionality | Announcements, class updates, messages, daily reports, parent concerns, feedback |

### Device or other IDs
| Type | Collected | Required/Optional | Purposes | Source |
|---|---|---|---|---|
| Device or other IDs | **Yes** | Optional | App functionality | FCM push token stored per user — `services/notificationService.ts` |

### Declare as NOT collected
- **App activity** — no analytics SDK. No `getAnalytics`, no `logEvent`.
- **App info and performance** (crash logs, diagnostics) — no Crashlytics.
- **Approximate location** — the geofence requests precise; declaring precise covers it.
- **Purchase history / payment info** — payment is external.
- **Contacts, calendar, search history, installed apps, race/ethnicity, political or religious beliefs, sexual orientation** — none.

---

## Two things to fix before you submit

### 1. The CAMERA permission is declared but unused

`AndroidManifest.xml:45` declares `android.permission.CAMERA`. Nothing uses it:
`html5-qrcode` is in `package.json` but **imported nowhere** in `src/`, and
`QRScanner.tsx` is a button-based check-in with no camera. The photo uploads use
`<input type="file" accept="image/*">`, which goes through the system picker and
needs no CAMERA permission.

An unused sensitive permission invites review questions and forces you to justify
a capability the app doesn't have. Remove line 45, and drop the unused
`html5-qrcode` dependency. Same for `READ/WRITE_EXTERNAL_STORAGE` — the system
picker doesn't need them on modern Android; verify uploads still work before
removing.

### 2. Target audience — answer "not designed for children"

In **App content → Target audience and content**, choose an adults-only age
group (18+). The app stores data *about* children, but children never use it:
accounts are created by school admins for staff and parents, and there is no
child-facing flow. Selecting an under-13 age band pulls the app into the
**Families policy**, which adds requirements you don't otherwise have to meet.
Answer the "Is your app designed for children?" question **No**.

---

## Privacy policy — what changed today

`public/privacy-policy.html` was materially incomplete: it declared only names,
class, attendance and guardian contacts. It did not mention location, health
data, photos, documents, push tokens, or EmailJS. Play cross-checks the policy
against the Data safety form, so the mismatch would have failed review on its
own. Updated sections:

- **§1 Information We Collect** — now enumerates every field above, including
  the staff geofence and the children's health fields, and states plainly that
  there is no advertising, analytics, or crash reporting.
- **§5 Data Sharing** — names Firebase and EmailJS as processors and says what
  EmailJS receives (feedback text, name, email, role).
- **§6 Retention and Deletion** — links the account-deletion page.
- Last-updated date bumped to 28 August 2026.

Previous version kept at `public/privacy-policy.html.bak`.

**The updated policy is not live yet** — it must be deployed before you submit,
because Play fetches the URL. Run `./deploy.sh` (or `firebase deploy --only
hosting`) from the repo root, then confirm the new text is served.
