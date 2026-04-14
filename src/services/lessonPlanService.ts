import { collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { LessonPlan } from '../types/index';

const COLLECTION = 'lesson_plans';

export const createLessonPlan = async (plan: Omit<LessonPlan, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...plan,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating lesson plan:', error);
    throw error;
  }
};

export const getLessonPlansByTeacher = async (teacherId: string): Promise<LessonPlan[]> => {
  try {
    const q = query(collection(db, COLLECTION), where('teacherId', '==', teacherId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlan))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (error) {
    console.error('Error getting lesson plans:', error);
    return [];
  }
};

export const getLessonPlansByClass = async (classId: string): Promise<LessonPlan[]> => {
  try {
    const q = query(collection(db, COLLECTION), where('classId', '==', classId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlan))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (error) {
    console.error('Error getting lesson plans:', error);
    return [];
  }
};

export const deleteLessonPlan = async (planId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, planId));
};
