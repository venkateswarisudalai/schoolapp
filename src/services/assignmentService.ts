import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Assignment, AssignmentSubmission } from '../types/index';

const ASSIGNMENTS_COLLECTION = 'assignments';
const SUBMISSIONS_COLLECTION = 'assignment_submissions';

export const createAssignment = async (data: Omit<Assignment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

export const getAssignmentsByClass = async (classId: string): Promise<Assignment[]> => {
  try {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment));
  } catch (error) {
    console.error('Error getting assignments:', error);
    return [];
  }
};

export const getAssignmentsByTeacher = async (teacherId: string): Promise<Assignment[]> => {
  try {
    const q = query(collection(db, ASSIGNMENTS_COLLECTION), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error getting assignments:', error);
    return [];
  }
};

// Teacher's assignment list: their own + anything admin created school-wide.
export const getAssignmentsForTeacher = async (teacherId: string): Promise<Assignment[]> => {
  try {
    const [ownSnap, adminSnap] = await Promise.all([
      getDocs(query(collection(db, ASSIGNMENTS_COLLECTION), where('teacherId', '==', teacherId))),
      getDocs(query(collection(db, ASSIGNMENTS_COLLECTION), where('createdByRole', '==', 'admin'))),
    ]);
    const map = new Map<string, Assignment>();
    ownSnap.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() } as Assignment));
    adminSnap.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() } as Assignment));
    return Array.from(map.values())
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error getting assignments for teacher:', error);
    return [];
  }
};

export const getAllAssignments = async (): Promise<Assignment[]> => {
  try {
    const snap = await getDocs(collection(db, ASSIGNMENTS_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error getting all assignments:', error);
    return [];
  }
};

export const updateAssignment = async (id: string, data: Partial<Assignment>): Promise<void> => {
  try {
    await updateDoc(doc(db, ASSIGNMENTS_COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

export const deleteAssignment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

// Submissions
export const createSubmission = async (data: Omit<AssignmentSubmission, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
      ...data,
      submittedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
};

export const getSubmissionsByAssignment = async (assignmentId: string): Promise<AssignmentSubmission[]> => {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('assignmentId', '==', assignmentId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AssignmentSubmission));
  } catch (error) {
    console.error('Error getting submissions:', error);
    return [];
  }
};

export const updateSubmission = async (id: string, data: Partial<AssignmentSubmission>): Promise<void> => {
  try {
    await updateDoc(doc(db, SUBMISSIONS_COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
};
