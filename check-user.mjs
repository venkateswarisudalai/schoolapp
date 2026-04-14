import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

const userId = '8Nz4mTygXYPoRccyjfcyAYpMeJC2';

async function checkUser() {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    console.log('\n🔍 Checking Firestore document for user:', userId);
    console.log('Email: venki10march@gmail.com\n');

    if (docSnap.exists()) {
      console.log('✅ Document EXISTS in Firestore\n');
      console.log('Document data:');
      const data = docSnap.data();
      console.log(JSON.stringify(data, null, 2));

      console.log('\n📋 Verification:');
      console.log('- role:', data.role, data.role === 'admin' ? '✅' : '❌ Should be "admin"');
      console.log('- approvalStatus:', data.approvalStatus, data.approvalStatus === 'approved' ? '✅' : '❌ Should be "approved"');
      console.log('- email:', data.email, data.email === 'venki10march@gmail.com' ? '✅' : '❌');

      if (data.role === 'admin' && data.approvalStatus === 'approved') {
        console.log('\n✅ User is configured correctly as admin!');
        console.log('You should be able to login at: https://school-c0203.web.app');
      } else {
        console.log('\n❌ User configuration is incorrect!');
        console.log('Fix in Firestore console:');
        console.log('https://console.firebase.google.com/project/school-c0203/firestore/data/~2Fusers~2F' + userId);
      }
    } else {
      console.log('❌ Document DOES NOT EXIST in Firestore!');
      console.log('\nYou need to create it at:');
      console.log('https://console.firebase.google.com/project/school-c0203/firestore/data/~2Fusers');
      console.log('\nDocument ID:', userId);
      console.log('\nFields to add:');
      console.log({
        email: 'venki10march@gmail.com',
        name: 'Vignesh - School Administrator',
        role: 'admin',
        approvalStatus: 'approved',
        phone: '+91 9876543210'
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
