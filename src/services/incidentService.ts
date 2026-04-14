import { collection, addDoc, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { IncidentReport } from '../types/index';

const COLLECTION_NAME = 'incidents';

export const createIncident = async (data: Omit<IncidentReport, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAtTimestamp: Timestamp.now(),
    });

    // Notify parent
    try {
      const { createNotification } = await import('./notificationService');
      const childrenSnap = await getDocs(query(collection(db, 'children'), where('__name__', '==', data.childId)));
      if (!childrenSnap.empty) {
        const childData = childrenSnap.docs[0].data();
        const parentIds = childData.parentIds || [];
        for (const pid of parentIds) {
          await createNotification(
            pid,
            `Incident Report: ${data.childName}`,
            `${data.severity} incident - ${data.description.substring(0, 80)}`,
            'incident'
          );
        }
      }
    } catch { /* best effort */ }

    return docRef.id;
  } catch (error) {
    console.error('Error creating incident:', error);
    throw error;
  }
};

export const getIncidentsByChild = async (childId: string): Promise<IncidentReport[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('childId', '==', childId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as IncidentReport));
  } catch (error) {
    console.error('Error getting incidents:', error);
    return [];
  }
};

export const getAllIncidents = async (): Promise<IncidentReport[]> => {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as IncidentReport))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting all incidents:', error);
    return [];
  }
};

export const acknowledgeIncident = async (incidentId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, incidentId), {
      parentAcknowledged: true,
      parentAcknowledgedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error acknowledging incident:', error);
    throw error;
  }
};
