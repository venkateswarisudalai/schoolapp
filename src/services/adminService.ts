import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserRole, AllergyInfo, MedicationInfo, EmergencyContact, AuthorizedPickup } from '../types/index';
import { getClassCode } from '../data/classes';

const formatAdmissionNumber = (code: string, n: number): string => {
  const padded = n < 100 ? String(n).padStart(2, '0') : String(n);
  return `mkp-${code}-${padded}`;
};

// Read the current max roll number for every class in one pass.
// Returns a map of classId -> highest existing roll (0 if none).
// Used by bulk import to deterministically assign mkp-{code}-NN before any write,
// avoiding the read-after-write cache race that single-shot generation hits.
export const getMaxRollNumbers = async (classIds: string[]): Promise<Record<string, number>> => {
  const uniqueClassIds = Array.from(new Set(classIds));
  const result: Record<string, number> = {};
  await Promise.all(uniqueClassIds.map(async classId => {
    const code = getClassCode(classId);
    const snap = await getDocs(query(collection(db, 'children'), where('classId', '==', classId)));
    const pattern = new RegExp(`^mkp-${code}-(\\d+)$`, 'i');
    let maxRoll = 0;
    snap.docs.forEach(d => {
      const adm = (d.data().admissionNumber || '') as string;
      const m = adm.match(pattern);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxRoll) maxRoll = n;
      }
    });
    result[classId] = maxRoll;
  }));
  return result;
};

// Generate next admission number for a class: mkp-{code}-{NN}.
// Single-student path (CreateStudent.tsx). Bulk import should use getMaxRollNumbers + formatAdmissionNumber.
const generateAdmissionNumber = async (classId: string): Promise<string> => {
  const maxRolls = await getMaxRollNumbers([classId]);
  return formatAdmissionNumber(getClassCode(classId), (maxRolls[classId] || 0) + 1);
};

export { formatAdmissionNumber };

// Generate a shareable parent password. Avoids confusable chars (0/O/1/l/I)
// so it's easy to read aloud or paste into WhatsApp without errors.
export const generateShareablePassword = (length = 8): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
};

// Build the auto-assigned parent login email from an admission number.
// e.g. mkp-prekg-02 → mkp-prekg-02@mayurischool.com
export const buildParentLoginEmail = (admissionNumber: string): string => {
  return `${admissionNumber.toLowerCase()}@mayurischool.com`;
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

// Resolve an existing parent's UID from email, falling back to a sign-in probe.
// Used during import when the auth account already exists (e.g., student was deleted
// but the auth account/user doc was left behind because Firebase Client SDK can't
// delete an auth user).
const findParentUidByEmail = async (email: string, password: string): Promise<string | null> => {
  // 1. Try Firestore users collection
  const snap = await getDocs(query(
    collection(db, 'users'),
    where('email', '==', email),
    where('role', '==', 'parent'),
  ));
  if (!snap.empty) return snap.docs[0].id;

  // 2. Fall back to a sign-in probe on a secondary app so the admin's session is untouched.
  // This recovers the UID for orphan auth accounts whose user doc was deleted.
  const secondaryApp = initializeApp(auth.app.options, 'lookup-' + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await signInWithEmailAndPassword(secondaryAuth, email, password);
    return credential.user.uid;
  } catch {
    return null;
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
  // Optional pre-computed admission number (used by bulk import to avoid Firestore read-after-write race)
  admissionNumber?: string;
  // When true, ignore parentEmail/parentPassword from the CSV and auto-generate
  // shareable credentials from the admission number. Used by the bulk import flow.
  autoGenerateCredentials?: boolean;
}

export const adminCreateStudent = async (data: CreateStudentData): Promise<{
  parentUserId: string;
  studentId: string;
  admissionNumber: string;
  parentUsername: string;
  parentEmail: string;
  parentPassword: string;
}> => {
  const adminUid = auth.currentUser?.uid;
  if (!adminUid) throw new Error('Admin must be logged in');

  try {
    // Bulk-import path: auto-generate a shareable email + password from the admission
    // number so the admin can hand login credentials to each parent. Single-student
    // path keeps the explicit fields the form collects.
    let parentEmail: string;
    let parentPassword: string;
    if (data.autoGenerateCredentials && data.admissionNumber) {
      parentEmail = buildParentLoginEmail(data.admissionNumber);
      parentPassword = generateShareablePassword();
    } else {
      parentEmail = data.parentEmail?.trim() ||
        (data.parentName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '.') + '@mayurischool.com');
      parentPassword = data.parentPassword;
    }
    const parentUsername = parentEmail.split('@')[0];

    // Create parent auth account — or reuse the existing one if the email is already
    // taken (common case: student was deleted, but auth account couldn't be removed
    // from the client SDK, so the parent record lingers).
    let parentUserId: string;
    let reusedExistingParent = false;
    try {
      parentUserId = await createUserWithoutSignIn(parentEmail, parentPassword);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code !== 'auth/email-already-in-use') throw err;
      const existingUid = await findParentUidByEmail(parentEmail, parentPassword);
      if (!existingUid) {
        throw new Error(
          `Parent email ${parentEmail} already exists in Firebase Auth but the password doesn't match. ` +
          `Reset the password from Firebase Console, or change the parent email.`
        );
      }
      parentUserId = existingUid;
      reusedExistingParent = true;
    }

    // Generate student ID (internal Firestore key) + admission number (human-readable)
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const admissionNumber = data.admissionNumber || await generateAdmissionNumber(data.classId);

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

    // Create or update the parent user document
    if (reusedExistingParent) {
      // Check whether a user doc already exists; if so append the new child,
      // otherwise create it from scratch (orphan auth account case).
      const existingDoc = await getDoc(doc(db, 'users', parentUserId));
      if (existingDoc.exists()) {
        await updateDoc(doc(db, 'users', parentUserId), {
          children: arrayUnion(studentId),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'users', parentUserId), {
          email: parentEmail,
          name: data.parentName,
          role: 'parent',
          phone: data.parentPhone,
          approvalStatus: 'approved',
          children: [studentId],
          initialPassword: parentPassword,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: adminUid,
        });
      }
    } else {
      await setDoc(doc(db, 'users', parentUserId), {
        email: parentEmail,
        name: data.parentName,
        role: 'parent',
        phone: data.parentPhone,
        approvalStatus: 'approved',
        children: [studentId],
        initialPassword: parentPassword,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: adminUid,
      });
    }

    return { parentUserId, studentId, admissionNumber, parentUsername, parentEmail, parentPassword };
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Generate a fresh shareable password for an existing parent and persist it
// so admin can show/share it from the Students page. Tries known passwords
// (the stored initialPassword first, then the old default 'Parent@123') so
// it works for both new and old students.
//
// Firebase client SDK can't reset another user's password without
// signing in as them, so we open a secondary app, log in there, call
// updatePassword, then throw the app away. Admin's session is untouched.
export const regenerateParentPassword = async (
  parentUserId: string,
  candidateOldPasswords: string[] = [],
): Promise<string> => {
  const parentDoc = await getDoc(doc(db, 'users', parentUserId));
  if (!parentDoc.exists()) throw new Error('Parent record not found');
  const parentData = parentDoc.data();
  const parentEmail = parentData.email as string | undefined;
  if (!parentEmail) throw new Error('Parent has no email on file');

  const existingInitial = (parentData.initialPassword || '') as string;
  // Try the stored password first, then admin-supplied ones, then the legacy default.
  const candidates = Array.from(new Set([
    ...(existingInitial ? [existingInitial] : []),
    ...candidateOldPasswords.filter(Boolean),
    'Parent@123',
  ]));

  const newPassword = generateShareablePassword();
  const secondaryApp = initializeApp(auth.app.options, 'pwreset-' + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  try {
    let signedIn = false;
    let lastErr: unknown = null;
    for (const candidate of candidates) {
      try {
        const cred = await signInWithEmailAndPassword(secondaryAuth, parentEmail, candidate);
        await updatePassword(cred.user, newPassword);
        signedIn = true;
        break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!signedIn) {
      throw new Error(
        `Couldn't sign in as ${parentEmail} to reset password. ` +
        `Reset it manually from the Firebase Console, then enter the new password here. ` +
        `(${(lastErr as { code?: string })?.code || 'unknown error'})`
      );
    }
  } finally {
    await deleteApp(secondaryApp);
  }

  await updateDoc(doc(db, 'users', parentUserId), {
    initialPassword: newPassword,
    updatedAt: serverTimestamp(),
  });

  return newPassword;
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
