import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { User, UserRole, ApprovalStatus } from '../types/index';

const USERS_COLLECTION = 'users';

// Create or update user in Firestore
export const createOrUpdateUser = async (userData: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  approvalStatus: ApprovalStatus;
}): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userData.id);
  const existingUser = await getDoc(userRef);

  if (existingUser.exists()) {
    // User exists, don't overwrite approval status
    return;
  }

  // New user - create with pending status
  await setDoc(userRef, {
    ...userData,
    requestedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Get user by ID from Firestore
export const getUserById = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: userDoc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone || '',
      avatar: data.avatar,
      approvalStatus: data.approvalStatus,
      requestedAt: data.requestedAt?.toDate?.()?.toISOString() || data.requestedAt,
      ...(data.assignedClasses && { assignedClasses: data.assignedClasses }),
      ...(data.children && { children: data.children }),
    } as User;
  }

  return null;
};

// Update user approval status
export const updateUserApprovalStatus = async (
  userId: string,
  status: ApprovalStatus
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    approvalStatus: status,
    updatedAt: serverTimestamp(),
  });
};

// Update user role
export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    role: role,
    updatedAt: serverTimestamp(),
  });
};

// Subscribe to pending users (real-time)
export const subscribeToPendingUsers = (
  callback: (users: User[]) => void
): (() => void) => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('approvalStatus', '==', 'pending')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const users: User[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone || '',
        avatar: data.avatar,
        approvalStatus: data.approvalStatus,
        requestedAt: data.requestedAt?.toDate?.()?.toISOString() || data.requestedAt,
      } as User;
    });
    callback(users);
  });

  return unsubscribe;
};

// Update user profile fields
export const updateUserProfile = async (
  userId: string,
  data: { name?: string; phone?: string; avatar?: string }
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Upload profile photo to Firebase Storage
export const uploadProfilePhoto = async (
  userId: string,
  file: File
): Promise<string> => {
  const storageRef = ref(storage, `profile-photos/${userId}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  // Save URL to user document
  await updateUserProfile(userId, { avatar: downloadURL });
  return downloadURL;
};

// Subscribe to a single user's data (real-time)
export const subscribeToUser = (
  userId: string,
  callback: (user: User | null) => void
): (() => void) => {
  const userRef = doc(db, USERS_COLLECTION, userId);

  const unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone || '',
        avatar: data.avatar,
        approvalStatus: data.approvalStatus,
        requestedAt: data.requestedAt?.toDate?.()?.toISOString() || data.requestedAt,
        ...(data.assignedClasses && { assignedClasses: data.assignedClasses }),
        ...(data.children && { children: data.children }),
      } as User);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};
