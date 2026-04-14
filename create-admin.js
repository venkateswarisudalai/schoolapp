// Admin Account Creation Script for Mayuri School App
// This script creates an admin account with email and password

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  readFileSync('./firebase-service-account.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'school-c0203'
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdmin() {
  const adminEmail = 'venki10march@gmail.com';
  const adminPassword = 'MayuriAdmin@2026'; // Change this password!
  const adminName = 'Vignesh - School Administrator';
  const adminPhone = '+91 9876543210';

  try {
    console.log('Creating admin user in Firebase Authentication...');

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: adminName,
      emailVerified: true,
    });

    console.log('✅ User created in Authentication with UID:', userRecord.uid);

    // Create user document in Firestore
    console.log('Creating admin document in Firestore...');

    await db.collection('users').doc(userRecord.uid).set({
      email: adminEmail,
      name: adminName,
      role: 'admin',
      approvalStatus: 'approved',
      phone: adminPhone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Admin document created in Firestore');
    console.log('\n🎉 Admin account created successfully!');
    console.log('\n📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 User ID:', userRecord.uid);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🌐 Login at: https://school-c0203.web.app');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
