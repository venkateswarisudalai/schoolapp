import { collection, addDoc, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ParentConcern, ParentConcernScope } from '../types/index';

const COLLECTION = 'parent_concerns';

export const createConcern = async (data: Omit<ParentConcern, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAtTs: Timestamp.now(),
  });
  return docRef.id;
};

export const getConcernsByParent = async (parentId: string): Promise<ParentConcern[]> => {
  const q = query(collection(db, COLLECTION), where('parentId', '==', parentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ParentConcern))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const getConcernsByScope = async (scope: ParentConcernScope): Promise<ParentConcern[]> => {
  const q = query(collection(db, COLLECTION), where('scope', '==', scope));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ParentConcern))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const getAllConcerns = async (): Promise<ParentConcern[]> => {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ParentConcern))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const resolveConcern = async (
  concernId: string,
  resolution: string,
  resolvedBy: string
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, concernId), {
    status: 'resolved',
    resolution,
    resolvedBy,
    resolvedAt: new Date().toISOString(),
  });
};
