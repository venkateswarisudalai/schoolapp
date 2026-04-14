// Script to list all users in Firebase Authentication
// This helps you see which usernames are already taken
// Run with: node scripts/listUsers.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function listAllUsers() {
  try {
    console.log('\n📋 Listing all users in Firestore:\n');

    // Get all user documents from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));

    if (usersSnapshot.empty) {
      console.log('No users found in Firestore.');
      return;
    }

    console.log('Total users:', usersSnapshot.size);
    console.log('─'.repeat(80));

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const username = userData.email?.split('@')[0] || 'N/A';

      console.log(`
👤 Name: ${userData.name || 'N/A'}
   Username: ${username}
   Email: ${userData.email || 'N/A'}
   Role: ${userData.role || 'N/A'}
   Status: ${userData.approvalStatus || 'N/A'}
   UID: ${doc.id}
${'─'.repeat(80)}`);
    });

    console.log('\n✅ User list complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listAllUsers();
