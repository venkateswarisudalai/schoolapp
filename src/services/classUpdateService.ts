import { collection, addDoc, getDocs, query, where, Timestamp, writeBatch, doc } from 'firebase/firestore';
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

// A per-student copy of a class update, fanned out to every enrolled student so
// the update shows up on that child's own profile timeline (not only the
// class-level feed). `updateId` points back at the parent class_updates doc.
export interface StudentUpdate extends Omit<ClassUpdate, 'id'> {
  id: string;
  studentId: string;
  updateId: string;
}

const COLLECTION = 'class_updates';
const STUDENT_COLLECTION = 'student_updates';

export const createClassUpdate = async (data: Omit<ClassUpdate, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAtTimestamp: Timestamp.now(),
    });

    // Fan the update out to every student in the class and notify their parents.
    // Both derive from the same children query, so fetch it once.
    try {
      const childrenSnap = await getDocs(query(collection(db, 'children'), where('classId', '==', data.classId)));

      // Per-student copy so each child's profile timeline reflects this update.
      // Batched: class sizes are small (preschool), well under the 500 limit.
      if (!childrenSnap.empty) {
        const batch = writeBatch(db);
        childrenSnap.docs.forEach(childDoc => {
          const studentRef = doc(collection(db, STUDENT_COLLECTION));
          batch.set(studentRef, {
            ...data,
            studentId: childDoc.id,
            updateId: docRef.id,
            createdAtTimestamp: Timestamp.now(),
          });
        });
        await batch.commit();
      }

      // Notify every parent of every student in this class, not just the first.
      const { notifyUsers } = await import('./notificationService');
      const parentIds = [...new Set(childrenSnap.docs.flatMap(d => (d.data().parentIds as string[] | undefined) ?? []).filter(Boolean))];
      const title = data.type === 'daily' ? `Daily Update: ${data.className}` : `Weekly Update: ${data.className}`;
      await notifyUsers(parentIds as string[], title, data.summary.substring(0, 100), 'report');
    } catch { /* best effort */ }

    return docRef.id;
  } catch (error) {
    console.error('Error creating class update:', error);
    throw error;
  }
};

// All updates fanned out to a single student, newest first.
export const getStudentUpdates = async (studentId: string, limit = 20): Promise<StudentUpdate[]> => {
  try {
    const q = query(collection(db, STUDENT_COLLECTION), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as StudentUpdate))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting student updates:', error);
    return [];
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
