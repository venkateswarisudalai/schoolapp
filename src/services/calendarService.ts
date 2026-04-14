import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: 'holiday' | 'event' | 'exam' | 'meeting' | 'birthday';
  classId?: string; // Optional: for class-specific events
  createdAt?: any;
}

const COLLECTION_NAME = 'calendar_events';

// Create calendar event
export const createCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...eventData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Get events by date range
export const getEventsByDateRange = async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CalendarEvent));
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

// Get all upcoming events
export const getUpcomingEvents = async (limit: number = 10): Promise<CalendarEvent[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', today),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CalendarEvent));
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    throw error;
  }
};
