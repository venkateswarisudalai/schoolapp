import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserRole, AllergyInfo, MedicationInfo, EmergencyContact, AuthorizedPickup } from '../types/index';
import { getClassCode } from '../data/classes';

// Generate next admission number for a class: mkp-{code}-{NN}.
// Looks at existing children in that class, finds the max roll number, returns max+1
// zero-padded to 2 digits (3 digits if it grows past 99).
const generateAdmissionNumber = async (classId: string): Promise<string> => {
  const code = getClassCode(classId);
  const snap = await getDocs(query(collection(db, 'children'), where('classId', '==', classId)));
  let maxRoll = 0;
  const pattern = new RegExp(`^mkp-${code}-(\\d+)$`, 'i');
  snap.docs.forEach(d => {
    const adm = (d.data().admissionNumber || '') as string;
    const m = adm.match(pattern);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxRoll) maxRoll = n;
    }
  });
  const next = maxRoll + 1;
  const padded = next < 100 ? String(next).padStart(2, '0') : String(next);
  return `mkp-${code}-${padded}`;
};

// Create a secondary Firebase app for user creation to avoid switching the admin's session
const createUserWithoutSignIn = async (email: string, password: string) => {
  const secondaryApp = initializeApp(auth.app.options, 'secondary-' + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    return credential.user.uid;
  } finally {
    await deleteApp(secondaryApp);
  }
};

// Admin creates a user (teacher/parent) - auto-approved
export const adminCreateUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  qualification?: string;
  salary?: number;
  assignedClasses?: string[];
}): Promise<{ userId: string; email: string; password: string }> => {
  const adminUid = auth.currentUser?.uid;
  if (!adminUid) throw new Error('Admin must be logged in');

  try {
    const userId = await createUserWithoutSignIn(userData.email, userData.password);

    const userDoc: Record<string, unknown> = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone || '',
      approvalStatus: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: adminUid,
    };

    if (userData.role === 'teacher') {
      userDoc.qualification = userData.qualification || '';
      userDoc.salary = userData.salary || 0;
      userDoc.assignedClasses = userData.assignedClasses || ['class-1', 'class-2', 'class-3'];
    }

    await setDoc(doc(db, 'users', userId), userDoc);
    return { userId, email: userData.email, password: userData.password };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Admin creates a student with parent account
export interface CreateStudentData {
  studentName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  classId: string;
  admissionDate: string;
  bloodGroup: string;
  // Parent
  parentName: string;
  parentPhone: string;
  parentEmail: string; // Real Gmail/email for login & password reset
  parentPassword: string;
  // Address
  address: string;
  // Medical
  allergies: AllergyInfo[];
  medications: MedicationInfo[];
  medicalConditions: string[];
  doctorName: string;
  doctorPhone: string;
  // Emergency contacts
  emergencyContacts: EmergencyContact[];
  // Authorized pickups
  authorizedPickups: AuthorizedPickup[];
}

export const adminCreateStudent = async (data: CreateStudentData): Promise<{
  parentUserId: string;
  studentId: string;
  admissionNumber: string;
  parentUsername: string;
  parentEmail: string;
}> => {
  const adminUid = auth.currentUser?.uid;
  if (!adminUid) throw new Error('Admin must be logged in');

  try {
    // Use real email if provided, otherwise generate from name
    const parentEmail = data.parentEmail?.trim() ||
      (data.parentName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '.') + '@mayurischool.com');
    const parentUsername = parentEmail.split('@')[0];

    // Create parent auth account with real email
    const parentUserId = await createUserWithoutSignIn(parentEmail, data.parentPassword);

    // Generate student ID (internal Firestore key) + admission number (human-readable)
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const admissionNumber = await generateAdmissionNumber(data.classId);

    // Create child document with ALL details
    await setDoc(doc(db, 'children', studentId), {
      admissionNumber,
      name: data.studentName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      classId: data.classId,
      parentIds: [parentUserId],
      enrollmentDate: data.admissionDate,
      bloodGroup: data.bloodGroup || '',
      allergies: data.allergies || [],
      medications: data.medications || [],
      medicalConditions: data.medicalConditions || [],
      doctorName: data.doctorName || '',
      doctorPhone: data.doctorPhone || '',
      emergencyContacts: data.emergencyContacts.length > 0
        ? data.emergencyContacts
        : [{ name: data.parentName, relationship: 'Parent', phone: data.parentPhone, isPrimary: true, canPickup: true }],
      authorizedPickups: data.authorizedPickups || [],
      documents: [],
      createdAt: serverTimestamp(),
      createdBy: adminUid,
    });

    // Create parent user document
    await setDoc(doc(db, 'users', parentUserId), {
      email: parentEmail,
      name: data.parentName,
      role: 'parent',
      phone: data.parentPhone,
      approvalStatus: 'approved',
      children: [studentId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: adminUid,
    });

    return { parentUserId, studentId, admissionNumber, parentUsername, parentEmail };
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Migrate a parent from @mayurischool.com to real Gmail
export const migrateParentToGmail = async (
  oldUserId: string,
  newEmail: string,
  password: string
): Promise<{ newUserId: string; email: string }> => {
  const adminUid = auth.currentUser?.uid;
  if (!adminUid) throw new Error('Admin must be logged in');

  try {
    // 1. Get old user data
    const oldUserDoc = await getDoc(doc(db, 'users', oldUserId));
    if (!oldUserDoc.exists()) throw new Error('User not found');
    const oldData = oldUserDoc.data();

    // 2. Create new Firebase Auth account with Gmail
    const newUserId = await createUserWithoutSignIn(newEmail, password);

    // 3. Create new user document with same data but new email
    await setDoc(doc(db, 'users', newUserId), {
      ...oldData,
      email: newEmail,
      migratedFrom: oldUserId,
      updatedAt: serverTimestamp(),
    });

    // 4. Update all children to point to new parent ID
    const childrenSnap = await getDocs(
      query(collection(db, 'children'), where('parentIds', 'array-contains', oldUserId))
    );
    for (const childDoc of childrenSnap.docs) {
      const childData = childDoc.data();
      const newParentIds = (childData.parentIds || []).map(
        (id: string) => id === oldUserId ? newUserId : id
      );
      await updateDoc(doc(db, 'children', childDoc.id), { parentIds: newParentIds });
    }

    // Also check legacy parentId field
    const legacySnap = await getDocs(
      query(collection(db, 'children'), where('parentId', '==', oldUserId))
    );
    for (const childDoc of legacySnap.docs) {
      await updateDoc(doc(db, 'children', childDoc.id), { parentId: newUserId });
    }

    // 5. Update children array in new user doc
    const allChildren = [...childrenSnap.docs, ...legacySnap.docs];
    const childIds = [...new Set(allChildren.map(d => d.id))];
    if (childIds.length > 0) {
      await updateDoc(doc(db, 'users', newUserId), { children: childIds });
    }

    // 6. Delete old user document (keep auth account — can't delete from client)
    await deleteDoc(doc(db, 'users', oldUserId));

    return { newUserId, email: newEmail };
  } catch (error) {
    console.error('Error migrating parent:', error);
    throw error;
  }
};
