import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Announcement } from '../types/index';

const COLLECTION_NAME = 'announcements';

// Create announcement
export const createAnnouncement = async (announcementData: Omit<Announcement, 'id'>): Promise<string> => {
  try {
    console.log('announcementService: Received data:', announcementData);

    // Convert createdAt string to Timestamp if present
    const dataToSave = {
      ...announcementData,
      createdAt: announcementData.createdAt ? Timestamp.fromDate(new Date(announcementData.createdAt)) : Timestamp.now(),
    };

    console.log('announcementService: Data to save with Timestamp:', dataToSave);
    console.log('announcementService: Saving to collection:', COLLECTION_NAME);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);

    // Notify all approved users about the announcement
    try {
      const { notifyUsers } = await import('./notificationService');
      const usersSnap = await getDocs(query(
        collection(db, 'users'),
        where('approvalStatus', '==', 'approved')
      ));
      const userIds = usersSnap.docs.map(d => d.id);
      await notifyUsers(userIds, announcementData.title, announcementData.content.substring(0, 100), 'announcement');
    } catch { /* notification is best-effort */ }

    return docRef.id;
  } catch (error) {
    console.error('announcementService: Error creating announcement:', error);
    throw error;
  }
};

// Get all announcements (most recent first)
export const getAllAnnouncements = async (maxResults: number = 50): Promise<Announcement[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || '',
      } as Announcement;
    });
  } catch (error) {
    console.error('Error getting announcements:', error);
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || '',
        } as Announcement;
      });
    } catch (fallbackError) {
      console.error('Error getting announcements (fallback):', fallbackError);
      throw fallbackError;
    }
  }
};
