# Play Console — Common visual assets

Generated 2026-08-28. Everything below meets the Play Console constraints
listed on the store-listing form.

## What to upload where

| Play Console field | File | Spec | Status |
|---|---|---|---|
| App icon | `app-icon-512-noalpha.png` | PNG, ≤1 MB, 512×512 | 512×512, 147 KB, no alpha |
| Feature graphic | `feature-graphic-1024x500.png` | PNG/JPEG, ≤15 MB, 1024×500 | 1024×500, 192 KB |
| Phone screenshots | `phone-screenshots/01…06` | 2–8, PNG/JPEG, ≤8 MB each, 16:9 or 9:16, 320–3840 px per side | 6 × 1080×1920 (9:16), ~300–420 KB each |
| Video | — | optional | skipped |

Six screenshots at 1080×1920 clears both bars: the 2-screenshot minimum and
the "4+ screenshots at ≥1080 px per side" threshold for promotion eligibility.

## Screenshots

1. `01-parent-home.png` — Your child's whole day, in one place
2. `02-attendance.png` — Mark attendance in a single tap
3. `03-fees.png` — Fees, receipts and reminders — sorted
4. `04-admin-dashboard.png` — Run the whole school from one dashboard
5. `05-attendance-analytics.png` — Attendance trends at a glance
6. `06-class-updates.png` — Class updates that reach every parent

Play orders screenshots as uploaded, so upload in this sequence.

### No real student data

The app points at live production Firestore (`capacitor.config.ts` →
`school-c0203.web.app`), so capturing a logged-in session would have put real
children's names, parent contacts and fee balances on a public, indexed store
listing. Instead the screens are rendered from the app's own `src/App.css` and
its real lucide icon set, with invented students (Aarav Menon, Aanya Rao,
Vihaan Shetty, Ira Bhat, Kabir Naik) and invented amounts. Layout, colours,
spacing and iconography are the shipped UI; only the data is fictional.

## Regenerating

    cd playstore-assets/shots
    node extract-icons.mjs          # pull icon paths from lucide-react
    node build.mjs                  # emit HTML into www/
    (cd www && python3 -m http.server 8777 &)
    ./render.sh                     # headless Chrome → out/

The phone screen renders inside a 480 px-wide iframe on purpose: `App.css` has
a `@media (min-width: 768px)` block that switches the quick-actions grid to 8
columns and the stats grid to 4. Rendering directly in the 1080 px window
triggers that tablet layout and also makes `100vh` resolve to 1920 px, which
pushes the bottom nav off-screen. The iframe gives the app a true phone
viewport.

## Still to do

- Tablet, Chromebook and Android XR assets are untouched — only phone assets
  are required to publish.
- `feature-graphic-1024x500.OLD.png` is the previous version, kept for
  reference. It put the logo in a white box on a purple field that did not
  match the app's `#00897B` brand, and clipped the logo's lower edge.
