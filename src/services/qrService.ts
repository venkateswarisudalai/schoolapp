import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { QRToken, CheckInRecord } from '../types/index';
import { saveAttendance, getAttendanceByChild, updateAttendance } from './attendanceService';

const QR_COLLECTION = 'qr_tokens';
const CHECKIN_COLLECTION = 'check_in_records';

export const generateQRToken = async (classId: string, createdBy: string): Promise<QRToken> => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    const token = crypto.randomUUID();

    const tokenData = {
      classId,
      token,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      createdBy,
    };

    const docRef = await addDoc(collection(db, QR_COLLECTION), {
      ...tokenData,
      createdAtTimestamp: Timestamp.now(),
    });

    return { id: docRef.id, ...tokenData };
  } catch (error) {
    console.error('Error generating QR token:', error);
    throw error;
  }
};

export const validateQRToken = async (token: string): Promise<QRToken | null> => {
  try {
    const q = query(
      collection(db, QR_COLLECTION),
      where('token', '==', token),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const qrToken: QRToken = {
      id: doc.id,
      classId: data.classId,
      token: data.token,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
      createdBy: data.createdBy,
    };

    // Check expiry
    if (new Date(qrToken.expiresAt) < new Date()) {
      return null;
    }

    return qrToken;
  } catch (error) {
    console.error('Error validating QR token:', error);
    throw error;
  }
};

export const getActiveTokenForClass = async (classId: string): Promise<QRToken | null> => {
  try {
    const q = query(
      collection(db, QR_COLLECTION),
      where('classId', '==', classId),
      orderBy('expiresAt', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const qrToken: QRToken = {
      id: doc.id,
      classId: data.classId,
      token: data.token,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
      createdBy: data.createdBy,
    };

    if (new Date(qrToken.expiresAt) < new Date()) {
      return null;
    }

    return qrToken;
  } catch (error) {
    console.error('Error getting active token:', error);
    throw error;
  }
};

export const recordCheckIn = async (data: Omit<CheckInRecord, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CHECKIN_COLLECTION), {
      ...data,
      createdAtTimestamp: Timestamp.now(),
    });

    // Sync with attendance collection
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await getAttendanceByChild(data.childId, today, today);

    if (existingAttendance.length > 0) {
      await updateAttendance(existingAttendance[0].id, {
        checkInTime: new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'present',
      });
    } else {
      await saveAttendance({
        childId: data.childId,
        date: today,
        status: 'present',
        checkInTime: new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        markedBy: data.parentId,
        notes: 'Checked in via QR code',
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error recording check-in:', error);
    throw error;
  }
};

export const recordCheckOut = async (data: Omit<CheckInRecord, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CHECKIN_COLLECTION), {
      ...data,
      createdAtTimestamp: Timestamp.now(),
    });

    // Update attendance checkout time
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await getAttendanceByChild(data.childId, today, today);

    if (existingAttendance.length > 0) {
      await updateAttendance(existingAttendance[0].id, {
        checkOutTime: new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error recording check-out:', error);
    throw error;
  }
};

export const getCheckInRecordsByChild = async (childId: string, date: string): Promise<CheckInRecord[]> => {
  try {
    const startOfDay = new Date(date + 'T00:00:00').toISOString();
    const endOfDay = new Date(date + 'T23:59:59').toISOString();

    const q = query(
      collection(db, CHECKIN_COLLECTION),
      where('childId', '==', childId),
      where('timestamp', '>=', startOfDay),
      where('timestamp', '<=', endOfDay)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as CheckInRecord));
  } catch (error) {
    console.error('Error getting check-in records:', error);
    throw error;
  }
};

export const getTodayCheckInsForChild = async (childId: string): Promise<CheckInRecord[]> => {
  const today = new Date().toISOString().split('T')[0];
  return getCheckInRecordsByChild(childId, today);
};

// Fetch all check-in records between two ISO dates (inclusive). Used for admin QR analytics.
export const getAllCheckInsInRange = async (startDate: string, endDate: string): Promise<CheckInRecord[]> => {
  try {
    const startIso = new Date(startDate + 'T00:00:00').toISOString();
    const endIso = new Date(endDate + 'T23:59:59').toISOString();
    const q = query(
      collection(db, CHECKIN_COLLECTION),
      where('timestamp', '>=', startIso),
      where('timestamp', '<=', endIso),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CheckInRecord));
  } catch (error) {
    console.error('Error getting check-ins in range:', error);
    return [];
  }
};
