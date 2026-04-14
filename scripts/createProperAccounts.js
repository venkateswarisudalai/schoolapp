// Script to create proper teacher accounts with name-based usernames
// Run with: node scripts/createProperAccounts.js

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

const accounts = [
  // Teachers with real names
  {
    name: 'Anjali Desai',
    username: 'anjali.desai',
    role: 'teacher',
    phone: '9876543211',
    assignedClasses: ['class-1', 'class-2', 'class-3'],
  },
  {
    name: 'Rekha Patel',
    username: 'rekha.patel',
    role: 'teacher',
    phone: '9876543212',
    assignedClasses: ['class-1', 'class-2', 'class-3'],
  },
  {
    name: 'Sunita Verma',
    username: 'sunita.verma',
    role: 'teacher',
    phone: '9876543214',
    assignedClasses: ['class-2', 'class-3'],
  },
];

const PASSWORD = 'Mayuri@123';

async function createAccount(account) {
  const email = `${account.username}@mayurischool.com`;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, PASSWORD);
    const userData = {
      email,
      name: account.name,
      role: account.role,
      phone: account.phone,
      approvalStatus: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (account.assignedClasses) {
      userData.assignedClasses = account.assignedClasses;
    }
    await setDoc(doc(db, 'users', cred.user.uid), userData);
    console.log(`✅ ${account.role}: ${account.name}`);
    console.log(`   Username: ${account.username}  Password: ${PASSWORD}`);
    return true;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  ${account.name} (${account.username}) already exists`);
    } else {
      console.error(`❌ ${account.name}: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('👩‍🏫 Creating teacher accounts with proper names...\n');

  for (const account of accounts) {
    await createAccount(account);
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n📋 All Teacher Logins (password: Mayuri@123):');
  accounts.forEach(a => {
    console.log(`   ${a.username.padEnd(20)} → ${a.name}`);
  });

  console.log('\n🔑 Reminder - Admin: admin / admin123');
  console.log('🌐 Login at: https://school-c0203.web.app');

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
