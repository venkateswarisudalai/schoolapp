import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface StudentReport {
  id: string;
  childId: string;
  title: string;
  reportType: 'monthly' | 'term' | 'annual' | 'progress';
  period: string; // e.g., "January 2024", "Term 1 2024"
  academics?: {
    subject: string;
    grade: string;
    comments: string;
  }[];
  behavior?: {
    category: string;
    rating: number; // 1-5
    comments: string;
  }[];
  attendance?: {
    present: number;
    absent: number;
    total: number;
  };
  teacherComments?: string;
  overallGrade?: string;
  createdBy: string;
  createdAt?: any;
  date: string;
}

const COLLECTION_NAME = 'student_reports';

// Create student report
export const createStudentReport = async (reportData: Omit<StudentReport, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...reportData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// Get reports by child ID
export const getReportsByChild = async (childId: string): Promise<StudentReport[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('childId', '==', childId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudentReport));
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
};

// Get latest report for a child
export const getLatestReport = async (childId: string): Promise<StudentReport | null> => {
  try {
    const reports = await getReportsByChild(childId);
    return reports.length > 0 ? reports[0] : null;
  } catch (error) {
    console.error('Error getting latest report:', error);
    throw error;
  }
};
