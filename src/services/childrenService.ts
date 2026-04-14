import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Child } from '../types/index';

const COLLECTION_NAME = 'children';

// Get all children
export const getAllChildren = async (): Promise<Child[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Child));
  } catch (error) {
    console.error('Error getting children:', error);
    throw error;
  }
};

// Get children by parent ID (supports both parentId string and parentIds array)
export const getChildrenByParent = async (parentId: string): Promise<Child[]> => {
  try {
    // Try parentIds array first (new format)
    const q1 = query(collection(db, COLLECTION_NAME), where('parentIds', 'array-contains', parentId));
    const snapshot1 = await getDocs(q1);

    // Also try legacy parentId field
    const q2 = query(collection(db, COLLECTION_NAME), where('parentId', '==', parentId));
    const snapshot2 = await getDocs(q2);

    // Merge and deduplicate
    const allDocs = new Map<string, Child>();
    [...snapshot1.docs, ...snapshot2.docs].forEach(d => {
      allDocs.set(d.id, { id: d.id, ...d.data() } as Child);
    });

    return Array.from(allDocs.values());
  } catch (error) {
    console.error('Error getting children by parent:', error);
    throw error;
  }
};

// Get children by class
export const getChildrenByClass = async (classId: string): Promise<Child[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('classId', '==', classId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Child));
  } catch (error) {
    console.error('Error getting children by class:', error);
    throw error;
  }
};

// Get single child by ID
export const getChildById = async (childId: string): Promise<Child | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, childId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Child;
    }
    return null;
  } catch (error) {
    console.error('Error getting child:', error);
    throw error;
  }
};
