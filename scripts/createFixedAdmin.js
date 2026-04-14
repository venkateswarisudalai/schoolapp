// Script to create fixed admin account
// Admin: admin@mayuri / admin
// Run with: node scripts/createFixedAdmin.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBktAXNzw4AIb2oeqUS41poSbnH45qR940",
  authDomain: "school-c0203.firebaseapp.com",
  projectId: "school-c0203",
  storageBucket: "school-c0203.firebasestorage.app",
  messagingSenderId: "910785587784",
  appId: "1:910785587784:web:3875a96ee99fc7667bc67d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';
  const ADMIN_EMAIL = `${ADMIN_USERNAME}@mayurischool.com`;

  try {
    console.log('🔐 Creating admin account...');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');

    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = userCredential.user.uid;
    console.log(`✅ Created auth account with UID: ${uid}`);

    // Create user document
    await setDoc(doc(db, 'users', uid), {
      email: ADMIN_EMAIL,
      name: 'Administrator',
      role: 'admin',
      phone: '',
      approvalStatus: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Created user document in Firestore');

    console.log('\n🎉 Admin account created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin');
    console.log('\n🌐 Login at: https://school-c0203.web.app');
    console.log('\n✨ You can now create teachers and students from the admin portal!');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Admin account already exists!');
      console.log('\n📝 Login Credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin');
      console.log('\n🌐 Login at: https://school-c0203.web.app');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(0);
  }
}

createAdmin();
