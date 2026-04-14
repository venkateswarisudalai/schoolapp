import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'teacher';
  approvalStatus: string;
  createdAt?: any;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'parent';
  approvalStatus: string;
  children?: string[];
  createdAt?: any;
}

const COLLECTION_NAME = 'users';

// Get all teachers
export const getAllTeachers = async (): Promise<Teacher[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('role', '==', 'teacher'),
      where('approvalStatus', '==', 'approved')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Teacher));
  } catch (error) {
    console.error('Error getting teachers:', error);
    throw error;
  }
};

// Get all parents
export const getAllParents = async (): Promise<Parent[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('role', '==', 'parent'),
      where('approvalStatus', '==', 'approved')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Parent));
  } catch (error) {
    console.error('Error getting parents:', error);
    throw error;
  }
};

// Get all users (teachers, admins, parents)
export const getAllUsers = async (role?: string): Promise<any[]> => {
  try {
    let q = query(collection(db, COLLECTION_NAME));

    if (role) {
      q = query(collection(db, COLLECTION_NAME), where('role', '==', role));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};
