// Script to add sample students to Firebase
// Run with: node scripts/addSampleData.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Your Firebase config (from .env)
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

async function createStudent(studentData) {
  try {
    console.log(`Creating student: ${studentData.studentName}...`);

    // 1. Create parent account in Firebase Auth
    const parentCredential = await createUserWithEmailAndPassword(
      auth,
      studentData.parentEmail,
      studentData.parentPassword
    );
    const parentUserId = parentCredential.user.uid;
    console.log(`✓ Created parent auth account: ${parentUserId}`);

    // 2. Create student document
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
    });
    console.log(`✓ Created student document: ${studentId}`);

    // 3. Create parent user document
    await setDoc(doc(db, 'users', parentUserId), {
      email: studentData.parentEmail,
      name: studentData.parentName,
      role: 'parent',
      phone: studentData.parentPhone,
      approvalStatus: 'approved',
      childId: studentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`✓ Created parent user document`);

    console.log(`✅ Successfully created: ${studentData.studentName}`);
    console.log(`   Parent Login: ${studentData.parentEmail} / ${studentData.parentPassword}\n`);

    return {
      success: true,
      parentEmail: studentData.parentEmail,
      parentPassword: studentData.parentPassword,
      studentName: studentData.studentName
    };
  } catch (error) {
    console.error(`❌ Error creating ${studentData.studentName}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function addAllStudents() {
  console.log('🚀 Starting to add sample students...\n');

  const results = [];

  for (const student of sampleStudents) {
    const result = await createStudent(student);
    results.push(result);
    // Wait a bit between creations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`${index + 1}. ✅ ${result.studentName}`);
      console.log(`   Login: ${result.parentEmail} / ${result.parentPassword}`);
    } else {
      console.log(`${index + 1}. ❌ Failed: ${result.error}`);
    }
  });
  console.log('='.repeat(50));
  console.log('\n✨ Done! Students can now login at: https://school-c0203.web.app');
}

// Run the script
addAllStudents().catch(console.error);
