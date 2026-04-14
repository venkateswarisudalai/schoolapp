// Script to add real students and create admin account
// Run with: node scripts/addRealStudents.js

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

// Helper: generate email from parent name
function generateEmail(parentName) {
  return parentName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    + '@mayurischool.com';
}

// Helper: generate username from email
function getUsername(email) {
  return email.split('@')[0];
}

// All students from the provided data
const students = [
  {
    name: "Yaash Guhan G",
    classId: "class-2", // LKG = Rainbow LKG
    dob: "2021-08-17",
    gender: "male",
    parentName: "Gokila Gobinath",
    phone: "7397379810",
    address: "Plot No 731, TNHB Ayapakkam, Chennai 600077",
  },
  {
    name: "Monish K",
    classId: "class-2",
    dob: "2021-10-31",
    gender: "male",
    parentName: "Kanagalakshmi",
    phone: "8870512702",
    address: "Plot No 4077, T.N.H.B, Ayapakkam, Chennai",
  },
  {
    name: "Jayakarnan R S",
    classId: "class-2",
    dob: "2021-07-24",
    gender: "male",
    parentName: "G Suguna Devi",
    phone: "9962691819",
    address: "6208 Brindhavan Avenue, TNHB Colony, 3rd Floor",
  },
  {
    name: "K K Niranjan",
    classId: "class-2",
    dob: "2021-04-28",
    gender: "male",
    parentName: "Kamal Nathan G",
    phone: "8248783206",
    address: "No 60/42 Annai Sathya Nagar, Thirumullivoyal",
  },
  {
    name: "A H Adsha",
    classId: "class-2",
    dob: "2021-07-11",
    gender: "male",
    parentName: "N Adash",
    phone: "7299469947",
    address: "No.48 A, Rampoornam Nagar, 6th Cross",
  },
  {
    name: "B A Jagatveer Aadhiraiyyan",
    classId: "class-2",
    dob: "2021-11-10",
    gender: "male",
    parentName: "S Balamuralikrishna",
    phone: "6383793897",
    address: "No.7, Sai Maharishi Nilayam, 1st Cross MGR",
  },
  {
    name: "Vedasri S",
    classId: "class-2",
    dob: "2022-02-11",
    gender: "female",
    parentName: "Nandhini S",
    phone: "9940276095",
    address: "2224-TNHB, Ayapakkam, Ambattur, Chennai",
  },
  {
    name: "Praneesh S S R",
    classId: "class-2",
    dob: "2020-08-21",
    gender: "male",
    parentName: "Siva Kumar Rajalakshmi",
    phone: "8925199929",
    address: "5849 TNHB Ayapakkam, Chennai 600077",
  },
  {
    name: "P Prahasini Rao",
    classId: "class-2",
    dob: "2021-11-09",
    gender: "female",
    parentName: "P Janardhana Rao",
    phone: "8838208641",
    address: "No.13 A Narmada 1st Cross Street, Jothinagar",
  },
  {
    name: "P Sirpika",
    classId: "class-2",
    dob: "2021-03-15",
    gender: "female",
    parentName: "A Prabagaran",
    phone: "8015821752",
    address: "No.2138 TNHB, Ayyapakkam, Chennai 600077",
  },
  {
    name: "T Tianna Shifra",
    classId: "class-2",
    dob: "2021-01-07",
    gender: "female",
    parentName: "S Titus Edgarwin",
    phone: "7397166776",
    address: "5876 Plot No, B5 Second Floor, Royal Enclave",
  },
  {
    name: "K Aradhana",
    classId: "class-2",
    dob: "2020-07-24",
    gender: "female",
    parentName: "Kalaiyarasan",
    phone: "6374396776",
    address: "No 9357 TNHB Nagathamman Kovil Street",
  },
  {
    name: "G S Thoshik",
    classId: "class-3", // UKG = Star UKG
    dob: "2020-12-23",
    gender: "male",
    parentName: "M Ganesh Babu",
    phone: "9791112746",
    address: "No.3880 TNHB 5th Main Road, Ayapakkam",
  },
  {
    name: "Muhammed Eshaan F",
    classId: "class-3",
    dob: "2020-06-28",
    gender: "male",
    parentName: "Fathima K",
    phone: "8754536233",
    address: "No 3951 TNHB Ayapakkam, Chennai 600077",
  },
  {
    name: "S Saravana",
    classId: "class-3",
    dob: "2020-10-03",
    gender: "male",
    parentName: "R Suresh",
    phone: "9444454824",
    address: "114 Sembaruthi Street, Jothi Nagar, Annanur",
  },
  {
    name: "S M Jashwin",
    classId: "class-3",
    dob: "2020-11-20",
    gender: "male",
    parentName: "S K Mohanathan",
    phone: "7904839733",
    address: "3A, 1st Main Road, Jothi Nagar, Annanur, Chennai",
  },
  {
    name: "S M Jashritha",
    classId: "class-3",
    dob: "2020-11-20",
    gender: "female",
    parentName: "S K Mohanathan 2",
    phone: "7904839733",
    address: "3A, 1st Main Road, Jothi Nagar, Annanur, Chennai",
  },
  {
    name: "C Shakambari",
    classId: "class-2",
    dob: "2021-07-24",
    gender: "female",
    parentName: "P N Divya Vani",
    phone: "9789093119",
    address: "No. 7A, 1st Main Road, Jothi Nagar, Annanur",
  },
  {
    name: "P M Poorva",
    classId: "class-2",
    dob: "2021-05-01",
    gender: "female",
    parentName: "N Periyasamy",
    phone: "9445933566",
    address: "LIG 2238, TNHB, 5th Main Road, Ayapakkam, Chennai 600077",
  },
  {
    name: "A Hansika",
    classId: "class-3",
    dob: "2020-05-27",
    gender: "female",
    parentName: "V Ashok",
    phone: "9790772256",
    address: "2115, TNHB, Ayappakkam",
  },
  {
    name: "Siddhu",
    classId: "class-3",
    dob: "2020-11-26",
    gender: "male",
    parentName: "Raja Vinoliya",
    phone: "7904826480",
    address: "LIG 5336, TNHB Colony",
  },
];

const DEFAULT_PASSWORD = 'Mayuri@123';

async function createAdminAccount() {
  const email = 'admin@mayurischool.com';
  const password = 'admin123';

  try {
    console.log('🔐 Creating admin account...');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      name: 'Admin',
      role: 'admin',
      phone: '',
      approvalStatus: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Admin created: admin@mayurischool.com / admin123');
    console.log('   Username: admin\n');
    return cred.user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Admin already exists: admin@mayurischool.com / admin123\n');
      return null;
    }
    console.error('❌ Admin creation error:', error.message);
    return null;
  }
}

async function createTeacherAccount(name, username) {
  const email = `${username}@mayurischool.com`;
  const password = 'Mayuri@123';

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      name,
      role: 'teacher',
      phone: '',
      approvalStatus: 'approved',
      assignedClasses: ['class-1', 'class-2', 'class-3'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`✅ Teacher created: ${email} / ${password}`);
    return cred.user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`✅ Teacher already exists: ${email}`);
      return null;
    }
    console.error(`❌ Teacher error: ${error.message}`);
    return null;
  }
}

async function createStudentWithParent(student) {
  const parentEmail = generateEmail(student.parentName);
  const parentUsername = getUsername(parentEmail);

  try {
    // Create parent auth account
    const parentCred = await createUserWithEmailAndPassword(auth, parentEmail, DEFAULT_PASSWORD);
    const parentId = parentCred.user.uid;

    // Create student document
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await setDoc(doc(db, 'children', studentId), {
      name: student.name,
      dateOfBirth: student.dob,
      gender: student.gender,
      classId: student.classId,
      parentIds: [parentId],
      enrollmentDate: new Date().toISOString().split('T')[0],
      emergencyContacts: [{
        name: student.parentName,
        relationship: 'parent',
        phone: student.phone,
        isPrimary: true,
      }],
      documents: [],
      createdAt: serverTimestamp(),
    });

    // Create parent user document
    await setDoc(doc(db, 'users', parentId), {
      email: parentEmail,
      name: student.parentName,
      role: 'parent',
      phone: student.phone,
      approvalStatus: 'approved',
      children: [studentId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ ${student.name} (${student.classId === 'class-2' ? 'LKG' : 'UKG'})`);
    console.log(`   Parent: ${parentUsername} / ${DEFAULT_PASSWORD}`);

    return { success: true, studentName: student.name, parentUsername, parentEmail };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  ${student.name} - Parent ${parentEmail} already exists, skipping`);
      return { success: false, studentName: student.name, reason: 'already exists' };
    }
    console.error(`❌ ${student.name}: ${error.message}`);
    return { success: false, studentName: student.name, reason: error.message };
  }
}

async function main() {
  console.log('🏫 Mayuri Kids Villa - Data Setup\n');
  console.log('='.repeat(60));

  // 1. Create Admin
  await createAdminAccount();
  await new Promise(r => setTimeout(r, 500));

  // 2. Create Teachers
  console.log('\n👩‍🏫 Creating teachers...');
  await createTeacherAccount('Anjali Desai', 'teacher1');
  await new Promise(r => setTimeout(r, 500));
  await createTeacherAccount('Rekha Patel', 'teacher2');
  await new Promise(r => setTimeout(r, 500));

  // 3. Create Students with Parent Accounts
  console.log('\n👨‍👩‍👧‍👦 Creating students and parent accounts...\n');

  const results = [];
  for (const student of students) {
    const result = await createStudentWithParent(student);
    results.push(result);
    await new Promise(r => setTimeout(r, 800));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');

  console.log('🔑 ADMIN LOGIN:');
  console.log('   Username: admin');
  console.log('   Password: admin123\n');

  console.log('👩‍🏫 TEACHER LOGINS:');
  console.log('   Username: teacher1  Password: Mayuri@123');
  console.log('   Username: teacher2  Password: Mayuri@123\n');

  console.log('👨‍👩‍👧‍👦 PARENT LOGINS (all passwords: Mayuri@123):');
  const successful = results.filter(r => r.success);
  successful.forEach(r => {
    console.log(`   ${r.parentUsername.padEnd(30)} → ${r.studentName}`);
  });

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} skipped (already exist):`);
    failed.forEach(r => console.log(`   ${r.studentName} - ${r.reason}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Created: ${successful.length} students, ${failed.length} skipped`);
  console.log('🌐 Login at: https://school-c0203.web.app');
  console.log('='.repeat(60));

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
