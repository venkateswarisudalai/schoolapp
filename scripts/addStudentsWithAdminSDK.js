// Script to add students using Firebase Admin SDK
// Run with: node scripts/addStudentsWithAdminSDK.js

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
    console.log(`\nCreating student: ${studentData.studentName}...`);

    // Check if parent already exists
    let parentUserId;
    let parentExists = false;

    try {
      // Check if user exists by email
      const existingUser = await auth.getUserByEmail(studentData.parentEmail);
      parentUserId = existingUser.uid;
      parentExists = true;
      console.log(`  ℹ Parent account already exists: ${parentUserId}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new parent account
        const userRecord = await auth.createUser({
          email: studentData.parentEmail,
          password: studentData.parentPassword,
          displayName: studentData.parentName,
          emailVerified: true
        });
        parentUserId = userRecord.uid;
        console.log(`  ✓ Created parent auth account: ${parentUserId}`);
      } else {
        throw error;
      }
    }

    // Create student document
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.collection('children').doc(studentId).set({
      name: studentData.studentName,
      parentId: parentUserId,
      classId: studentData.classId,
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender,
      address: studentData.address,
      emergencyContact: studentData.emergencyContact,
      medicalInfo: studentData.medicalInfo || '',
      admissionDate: studentData.admissionDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`  ✓ Created student document: ${studentId}`);

    // Create/Update parent user document
    await db.collection('users').doc(parentUserId).set({
      email: studentData.parentEmail,
      name: studentData.parentName,
      role: 'parent',
      phone: studentData.parentPhone,
      approvalStatus: 'approved',
      childId: studentId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`  ✓ Created/Updated parent user document`);

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
    console.log('🚀 Starting to add sample students using Admin SDK...\n');

    const results = [];

    for (const student of sampleStudents) {
      const result = await createStudent(student);
      results.push(result);
      // Wait a bit between creations
      await new Promise(resolve => setTimeout(resolve, 1000));
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
