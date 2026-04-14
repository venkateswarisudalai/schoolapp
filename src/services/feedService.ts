import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { FeedPost } from '../types/index';

const COLLECTION_NAME = 'feed_posts';

export const createFeedPost = async (postData: Omit<FeedPost, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...postData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating feed post:', error);
    throw error;
  }
};

export const uploadFeedPhoto = async (postId: string, file: File): Promise<string> => {
  try {
    const fileId = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `feed_posts/${postId}/${fileId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading feed photo:', error);
    throw error;
  }
};

export const updateFeedPostPhotos = async (postId: string, photoUrls: string[]): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, postId);
    await updateDoc(docRef, { photoUrls });
  } catch (error) {
    console.error('Error updating feed post photos:', error);
    throw error;
  }
};

export const getFeedPostsByChild = async (childId: string, maxResults: number = 50): Promise<FeedPost[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('taggedChildIds', 'array-contains', childId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || d.data().createdAt,
    } as FeedPost));
  } catch (error) {
    console.error('Error getting feed posts by child:', error);
    throw error;
  }
};

export const getFeedPostsByClass = async (classId: string, maxResults: number = 50): Promise<FeedPost[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || d.data().createdAt,
    } as FeedPost));
  } catch (error) {
    console.error('Error getting feed posts by class:', error);
    throw error;
  }
};

export const getAllFeedPosts = async (maxResults: number = 50): Promise<FeedPost[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || d.data().createdAt,
    } as FeedPost));
  } catch (error) {
    console.error('Error getting all feed posts:', error);
    throw error;
  }
};

export const deleteFeedPost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, postId));
  } catch (error) {
    console.error('Error deleting feed post:', error);
    throw error;
  }
};
