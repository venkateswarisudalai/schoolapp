import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DailyActivity } from '../types/index';

const COLLECTION_NAME = 'activities';

// Create activity
export const createActivity = async (activityData: Omit<DailyActivity, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...activityData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

// Get activities by child ID
export const getActivitiesByChild = async (childId: string, maxResults: number = 50): Promise<DailyActivity[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('childId', '==', childId),
      orderBy('date', 'desc'),
      limit(maxResults)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DailyActivity));
  } catch (error) {
    console.error('Error getting activities:', error);
    throw error;
  }
};

// Get activities by date
export const getActivitiesByDate = async (date: string): Promise<DailyActivity[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DailyActivity));
  } catch (error) {
    console.error('Error getting activities by date:', error);
    throw error;
  }
};
