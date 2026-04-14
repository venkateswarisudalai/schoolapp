// Script to list all students and their associated accounts
// Run with: node scripts/listStudents.js

import { initializeApp } from 'firebase/app';
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
const db = getFirestore(app);

async function listAllStudents() {
  try {
    console.log('\n📚 Listing all students in the system:\n');

    // Get all children documents from Firestore
    const childrenSnapshot = await getDocs(collection(db, 'children'));

    if (childrenSnapshot.empty) {
      console.log('✅ No students found in the database. You can create new students!\n');
      process.exit(0);
      return;
    }

    console.log('Total students:', childrenSnapshot.size);
    console.log('─'.repeat(80));

    // Get all users to match student and parent accounts
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersMap = {};
    usersSnapshot.forEach(doc => {
      usersMap[doc.id] = doc.data();
    });

    childrenSnapshot.forEach((doc) => {
      const studentData = doc.data();
      const studentUser = usersMap[studentData.studentUserId];
      const parentUser = usersMap[studentData.parentId];

      const studentUsername = studentUser?.email?.split('@')[0] || 'N/A';
      const parentEmail = parentUser?.email || 'N/A';

      console.log(`
👦 Student Name: ${studentData.name || 'N/A'}
   Student Username: ${studentUsername}
   Student Email: ${studentUser?.email || 'N/A'}
   Parent Name: ${parentUser?.name || 'N/A'}
   Parent Email: ${parentEmail}
   Class: ${studentData.classId || 'N/A'}
   Gender: ${studentData.gender || 'N/A'}
   Student ID: ${doc.id}
${'─'.repeat(80)}`);
    });

    console.log('\n✅ Student list complete!\n');
    console.log('⚠️  If you want to create a new student, make sure to use:');
    console.log('   - A NEW student username (not listed above)');
    console.log('   - A NEW parent email (not listed above)\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listAllStudents();
