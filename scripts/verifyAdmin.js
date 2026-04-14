// Script to verify and fix admin account
// Run with: node scripts/verifyAdmin.js

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBktAXNzw4AIb2oeqUS41poSbnH45qR940",
  authDomain: "school-c0203.firebaseapp.com",
  projectId: "school-c0203",
  storageBucket: "school-c0203.firebasestorage.app",
  messagingSenderId: "910785587784",
  appId: "1:910785587784:web:3875a96ee99fc7667bc67d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'venki10march@gmail.com';
const ADMIN_PASSWORD = 'MayuriAdmin@2026';

async function verifyAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const adminCred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const adminUid = adminCred.user.uid;
    console.log(`✅ Logged in successfully! UID: ${adminUid}`);

    // Check if user document exists
    console.log('\n📄 Checking user document...');
    const userDocRef = doc(db, 'users', adminUid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log('✅ User document exists');
      console.log('Data:', userDoc.data());

      // Check if approvalStatus is set
      const data = userDoc.data();
      if (data.approvalStatus === 'approved' && data.role === 'admin') {
        console.log('\n✅ Admin account is properly configured!');
        console.log('   - Role: admin');
        console.log('   - Approval Status: approved');
      } else {
        console.log('\n⚠️  User document needs update');
        console.log('   Current role:', data.role);
        console.log('   Current approvalStatus:', data.approvalStatus);

        // Update the document
        await setDoc(userDocRef, {
          email: ADMIN_EMAIL,
          name: data.name || 'Vignesh - School Administrator',
          role: 'admin',
          approvalStatus: 'approved',
          phone: data.phone || '+91 9876543210',
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        console.log('✅ Updated admin document with proper role and approval status');
      }
    } else {
      console.log('❌ User document does not exist. Creating it...');

      // Create the user document
      await setDoc(userDocRef, {
        email: ADMIN_EMAIL,
        name: 'Vignesh - School Administrator',
        role: 'admin',
        approvalStatus: 'approved',
        phone: '+91 9876543210',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Created admin user document');
    }

    console.log('\n✨ Admin account is ready!');
    console.log('\nYou can now login and create users at: https://school-c0203.web.app');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAdmin();
