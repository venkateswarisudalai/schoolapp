import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

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

// Resize an image File to fit within `maxDim` (longest side) and re-encode as JPEG
// at the given quality. Returns a Blob ready for upload. ~10x smaller than the
// original phone photo for typical inputs.
export const resizeImage = (
  file: File,
  maxDim = 1600,
  quality = 0.85
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error('Image encode failed'));
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
};

// Upload a photo file to Firebase Storage. Resizes large images first and
// reports upload progress (0–100) via the optional callback.
export const uploadGalleryPhotoFile = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  // Skip resize for tiny files (already small) and non-images.
  let blob: Blob = file;
  let extension = file.name.split('.').pop() || 'jpg';
  if (file.type.startsWith('image/') && file.size > 400 * 1024) {
    blob = await resizeImage(file);
    extension = 'jpg';
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '');
  const path = `gallery/${Date.now()}_${safeName}.${extension}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, blob, { contentType: blob.type || 'image/jpeg' });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      snapshot => {
        if (onProgress && snapshot.totalBytes > 0) {
          onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(storageRef);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
};

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
