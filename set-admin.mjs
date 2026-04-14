import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
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
const db = getFirestore(app);

// User UID from Firebase Authentication
const userId = '8Nz4mTygXYPoRccyjfcyAYpMeJC2';

async function setAdminRole() {
  try {
    console.log('Setting admin role for user:', userId);

    await setDoc(doc(db, 'users', userId), {
      email: 'venki10march@gmail.com',
      name: 'Vignesh - School Administrator',
      role: 'admin',
      approvalStatus: 'approved',
      phone: '+91 9876543210',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Admin role set successfully!');
    console.log('\n📧 Login with:');
    console.log('Email: venki10march@gmail.com');
    console.log('Password: (your password)');
    console.log('\n🌐 App URL: https://school-c0203.web.app');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAdminRole();
