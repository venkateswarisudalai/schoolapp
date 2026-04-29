import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ClassUpdate {
  id: string;
  classId: string;
  className: string;
  type: 'daily' | 'weekly';
  date: string;
  weekStart?: string;
  weekEnd?: string;
  teacherId: string;
  teacherName: string;
  summary: string;
  activities: string;
  homework: string;
  reminders: string;
  createdAt: string;
}

const COLLECTION = 'class_updates';

export const createClassUpdate = async (data: Omit<ClassUpdate, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAtTimestamp: Timestamp.now(),
    });

    // Notify parents
    try {
      const { notifyUsers } = await import('./notificationService');
      const childrenSnap = await getDocs(query(collection(db, 'children'), where('classId', '==', data.classId)));
      const parentIds = [...new Set(childrenSnap.docs.map(d => d.data().parentIds?.[0]).filter(Boolean))];
      const title = data.type === 'daily' ? `Daily Update: ${data.className}` : `Weekly Update: ${data.className}`;
      await notifyUsers(parentIds as string[], title, data.summary.substring(0, 100), 'report');
    } catch { /* best effort */ }

    return docRef.id;
  } catch (error) {
    console.error('Error creating class update:', error);
    throw error;
  }
};

export const getClassUpdates = async (classId: string, limit = 20): Promise<ClassUpdate[]> => {
  try {
    const q = query(collection(db, COLLECTION), where('classId', '==', classId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as ClassUpdate))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting class updates:', error);
    return [];
  }
};

export const getLatestUpdateForClass = async (classId: string): Promise<ClassUpdate | null> => {
  const updates = await getClassUpdates(classId, 1);
  return updates[0] || null;
};

export const getAllClassUpdates = async (limit = 100): Promise<ClassUpdate[]> => {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as ClassUpdate))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting all class updates:', error);
    return [];
  }
};
