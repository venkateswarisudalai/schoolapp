import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { StaffAttendanceRecord } from '../types/index';

const COLLECTION_NAME = 'staff_attendance';
const IST_TZ = 'Asia/Kolkata';

// --- IST helpers -----------------------------------------------------------
// We always bucket and display staff attendance in IST (Asia/Kolkata) using
// Intl, so the log is correct even if a teacher's phone is on the wrong
// timezone. The underlying `timestamp` is still a real UTC instant.

// YYYY-MM-DD in IST. en-CA formats as a zero-padded ISO-style date.
export const istDateKey = (d: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);

// e.g. "09:05 AM" in IST.
export const istTimeLabel = (d: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(d);

// Friendly date for headers, e.g. "Saturday, 31 May 2026" in IST.
export const istDateLabel = (isoDate: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(isoDate + 'T00:00:00+05:30'));

// --- Writes ----------------------------------------------------------------

interface RecordInput {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  type: 'check-in' | 'check-out';
  method?: 'qr' | 'manual';
}

export const recordStaffAttendance = async (input: RecordInput): Promise<StaffAttendanceRecord> => {
  const now = new Date();
  const data: Omit<StaffAttendanceRecord, 'id'> = {
    teacherId: input.teacherId,
    teacherName: input.teacherName,
    teacherEmail: input.teacherEmail,
    type: input.type,
    timestamp: now.toISOString(),
    istDate: istDateKey(now),
    istTime: istTimeLabel(now),
    method: input.method || 'qr',
  };
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAtTimestamp: Timestamp.now(),
  });
  return { id: docRef.id, ...data };
};

// --- Reads -----------------------------------------------------------------
// Queries are single-field equality / range only, so no composite Firestore
// index is required.

// All staff records for a single IST day (every teacher). Sorted oldest-first.
export const getStaffRecordsByDate = async (istDate: string): Promise<StaffAttendanceRecord[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('istDate', '==', istDate));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as StaffAttendanceRecord))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Today's records for one teacher (used to decide check-in vs check-out).
export const getTodayStaffRecordsForTeacher = async (teacherId: string): Promise<StaffAttendanceRecord[]> => {
  const all = await getStaffRecordsByDate(istDateKey());
  return all.filter(r => r.teacherId === teacherId);
};

// All staff records between two IST dates (inclusive). Used for the admin log.
export const getStaffRecordsInRange = async (startIstDate: string, endIstDate: string): Promise<StaffAttendanceRecord[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('istDate', '>=', startIstDate),
    where('istDate', '<=', endIstDate),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as StaffAttendanceRecord))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
