// Script to add students as admin user
// Run with: node scripts/addStudentsAsAdmin.js

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Your Firebase config
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

// Admin credentials
const ADMIN_EMAIL = 'venki10march@gmail.com';
const ADMIN_PASSWORD = 'MayuriAdmin@2026';

// Sample students data
const sampleStudents = [
  {
    studentName: "Aarav Sharma",
    parentName: "Rajesh Sharma",
    parentEmail: "rajesh.sharma@example.com",
    parentPhone: "+91 9876543210",
    parentPassword: "Parent@123",
    classId: "nursery",
    dateOfBirth: "2021-03-15",
    gender: "male",
    address: "123 MG Road, Bangalore, Karnataka 560001",
    emergencyContact: "+91 9876543211",
    medicalInfo: "No known allergies",
    admissionDate: "2024-01-15"
  },
  {
    studentName: "Ananya Patel",
    parentName: "Priya Patel",
    parentEmail: "priya.patel@example.com",
    parentPhone: "+91 9876543220",
    parentPassword: "Parent@123",
    classId: "lkg",
    dateOfBirth: "2020-07-22",
    gender: "female",
    address: "456 Brigade Road, Bangalore, Karnataka 560025",
    emergencyContact: "+91 9876543221",
    medicalInfo: "",
    admissionDate: "2023-06-01"
  },
  {
    studentName: "Arjun Kumar",
    parentName: "Sunita Kumar",
    parentEmail: "sunita.kumar@example.com",
    parentPhone: "+91 9876543230",
    parentPassword: "Parent@123",
    classId: "ukg",
    dateOfBirth: "2019-11-08",
    gender: "male",
    address: "789 Indiranagar, Bangalore, Karnataka 560038",
    emergencyContact: "+91 9876543231",
    medicalInfo: "Lactose intolerant",
    admissionDate: "2022-04-10"
  }
];

async function createStudent(studentData, adminUid) {
  try {
    console.log(`\nCreating student: ${studentData.studentName}...`);

    // Check if parent already exists
    let parentUserId;
    let parentExists = false;

    try {
      // Try to create parent account
      const parentCredential = await createUserWithEmailAndPassword(
        auth,
        studentData.parentEmail,
        studentData.parentPassword
      );
      parentUserId = parentCredential.user.uid;
      console.log(`  ✓ Created parent auth account: ${parentUserId}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`  ℹ Parent account already exists, will link to existing account`);
        parentExists = true;
        // We can't get the UID easily, so we'll need to handle this differently
        // For now, skip this student
        throw new Error('Parent already exists - please use admin panel to link student');
      } else {
        throw error;
      }
    }

    // Re-authenticate as admin (needed after creating parent account)
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`  ✓ Re-authenticated as admin`);

    // Create student document
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await setDoc(doc(db, 'children', studentId), {
      name: studentData.studentName,
      parentId: parentUserId,
      classId: studentData.classId,
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender,
      address: studentData.address,
      emergencyContact: studentData.emergencyContact,
      medicalInfo: studentData.medicalInfo || '',
      admissionDate: studentData.admissionDate,
      createdAt: serverTimestamp(),
      createdBy: adminUid
    });
    console.log(`  ✓ Created student document: ${studentId}`);

    // Create/Update parent user document
    await setDoc(doc(db, 'users', parentUserId), {
      email: studentData.parentEmail,
      name: studentData.parentName,
      role: 'parent',
      phone: studentData.parentPhone,
      approvalStatus: 'approved',
      childId: studentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: adminUid
    });
    console.log(`  ✓ Created parent user document`);

    console.log(`✅ Successfully created: ${studentData.studentName}`);
    console.log(`   Parent Login: ${studentData.parentEmail} / ${studentData.parentPassword}`);

    return {
      success: true,
      parentEmail: studentData.parentEmail,
      parentPassword: studentData.parentPassword,
      studentName: studentData.studentName
    };
  } catch (error) {
    console.error(`❌ Error creating ${studentData.studentName}:`, error.message);
    return { success: false, error: error.message, studentName: studentData.studentName };
  }
}

async function main() {
  try {
    console.log('🔐 Logging in as admin...');
    const adminCred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const adminUid = adminCred.user.uid;
    console.log(`✅ Logged in as admin: ${adminUid}\n`);
    console.log('🚀 Starting to add sample students...');

    const results = [];

    for (const student of sampleStudents) {
      const result = await createStudent(student, adminUid);
      results.push(result);
      // Wait a bit between creations
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log('\n📊 Summary:');
    console.log('='.repeat(60));
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`${index + 1}. ✅ ${result.studentName}`);
        console.log(`   Login: ${result.parentEmail} / ${result.parentPassword}`);
      } else {
        console.log(`${index + 1}. ❌ ${result.studentName}: ${result.error}`);
      }
    });
    console.log('='.repeat(60));
    console.log('\n✨ Done! Students can now login at: https://school-c0203.web.app');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
