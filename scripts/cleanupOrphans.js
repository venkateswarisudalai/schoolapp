// One-shot cleanup of ORPHANED Firebase Auth accounts.
//
// When a student is deleted, the web app cannot remove the parent's Firebase
// Auth login (the client SDK has no permission to delete other users). The
// account lingers, so a later re-import of that admission number fails with
// "email already exists in Firebase Auth but the password doesn't match"
// (e.g. mkp-lkg-01@mayurischool.com). This script finds those leftover login
// accounts — ones with NO matching Firestore `users` document — and deletes
// them. Active parents always have a users doc, so they are never touched.
//
// Usage (run from the mayuri/ folder):
//   node scripts/cleanupOrphans.js            # DRY RUN: list what would be deleted
//   node scripts/cleanupOrphans.js --delete   # actually delete the orphans
//
// Requires ./firebase-service-account.json
//   (Firebase Console -> Project Settings -> Service Accounts -> Generate new
//    private key). The file is gitignored and stays on your machine.

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const DELETE = process.argv.includes('--delete');
const PARENT_DOMAIN = '@mayurischool.com';

// Hard safety list — these accounts are NEVER deleted, no matter what, as a
// second layer on top of the "has a Firestore user doc" check. The 8 live
// admin/teacher/parent logins.
const PROTECTED_EMAILS = new Set([
  'admin@mayurischool.com',
  'venkateswari@mayurischool.com',
  'mkp-prekg-01@mayurischool.com',
  'sandhiya.prekg@mayurischool.com',
  'vidhya.lkg@mayurischool.com',
  'fathima.playgroup@mayurischool.com',
  'deeparani.lkg@mayurischool.com',
  'renuka.ukg@mayurischool.com',
].map(e => e.toLowerCase()));

const serviceAccount = JSON.parse(readFileSync('./firebase-service-account.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'school-c0203',
});

const auth = admin.auth();
const db = admin.firestore();

async function main() {
  // Every uid / email that has a live Firestore users document.
  const usersSnap = await db.collection('users').get();
  const liveUids = new Set(usersSnap.docs.map(d => d.id));
  const liveEmails = new Set(
    usersSnap.docs.map(d => String(d.data().email || '').toLowerCase()).filter(Boolean),
  );
  console.log(`Firestore users (live records): ${liveUids.size}`);

  // Walk every Auth user, paging through 1000 at a time.
  const orphans = [];
  let total = 0;
  let pageToken;
  do {
    const res = await auth.listUsers(1000, pageToken);
    for (const u of res.users) {
      total++;
      const email = String(u.email || '').toLowerCase();
      if (!email.endsWith(PARENT_DOMAIN)) continue;          // only parent logins
      if (PROTECTED_EMAILS.has(email)) continue;             // never delete the live 8
      if (liveUids.has(u.uid) || liveEmails.has(email)) continue; // has a live record
      orphans.push({ uid: u.uid, email: u.email });
    }
    pageToken = res.pageToken;
  } while (pageToken);

  console.log(`Auth accounts scanned: ${total}`);
  console.log(`\nOrphaned parent logins (no Firestore user doc): ${orphans.length}`);
  orphans.forEach(o => console.log(`  ${o.email}  (${o.uid})`));

  if (orphans.length === 0) {
    console.log('\nNothing to clean up.');
    return;
  }
  if (!DELETE) {
    console.log('\nDRY RUN — nothing deleted. Re-run with --delete to remove these.');
    return;
  }

  const uids = orphans.map(o => o.uid);
  for (let i = 0; i < uids.length; i += 1000) {
    const batch = uids.slice(i, i + 1000);
    const r = await auth.deleteUsers(batch);
    console.log(`Deleted ${r.successCount}, failed ${r.failureCount}`);
    r.errors.forEach(e => console.log(`  error at index ${e.index}: ${e.error.message}`));
  }
  console.log('\nDone. Re-import is now safe for these admission numbers.');
}

main().catch(err => { console.error(err); process.exit(1); });
