import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface GalleryPhoto {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  date: string;
  category: 'activity' | 'event' | 'classroom' | 'outdoor' | 'celebration';
  classId?: string; // Optional: for class-specific photos
  childIds?: string[]; // Optional: tagged children
  uploadedBy: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'gallery';

// Create gallery photo
export const createGalleryPhoto = async (photoData: Omit<GalleryPhoto, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...photoData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating gallery photo:', error);
    throw error;
  }
};

// Get all photos
export const getAllPhotos = async (limit: number = 50): Promise<GalleryPhoto[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryPhoto));
  } catch (error) {
    console.error('Error getting photos:', error);
    throw error;
  }
};

// Get photos by category
export const getPhotosByCategory = async (category: string): Promise<GalleryPhoto[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('category', '==', category),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryPhoto));
  } catch (error) {
    console.error('Error getting photos by category:', error);
    throw error;
  }
};

// Get photos by child ID (photos where child is tagged)
export const getPhotosByChild = async (childId: string): Promise<GalleryPhoto[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('childIds', 'array-contains', childId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryPhoto));
  } catch (error) {
    console.error('Error getting photos by child:', error);
    throw error;
  }
};
