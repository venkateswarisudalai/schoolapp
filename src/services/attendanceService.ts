import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Attendance } from '../types/index';

const COLLECTION_NAME = 'attendance';

// Analytics Types
export interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  attendanceRate: number;
}

export interface DailyAttendanceSummary {
  date: string;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  total: number;
  rate: number;
}

export interface ClassAttendanceStats {
  classId: string;
  className: string;
  stats: AttendanceStats;
}

export interface StudentAttendanceRecord {
  childId: string;
  childName: string;
  stats: AttendanceStats;
}

export const saveAttendance = async (attendanceData: Omit<Attendance, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), attendanceData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving attendance:', error);
    throw error;
  }
};

export const bulkSaveAttendance = async (attendanceList: Omit<Attendance, 'id'>[]): Promise<void> => {
  try {
    for (const attendance of attendanceList) {
      // Check if record already exists for this child+date
      const existing = await getDocs(query(
        collection(db, COLLECTION_NAME),
        where('childId', '==', attendance.childId),
        where('date', '==', attendance.date)
      ));
      if (existing.empty) {
        await saveAttendance(attendance);
      } else {
        // Update existing record
        const docRef = doc(db, COLLECTION_NAME, existing.docs[0].id);
        await updateDoc(docRef, {
          status: attendance.status,
          checkInTime: attendance.checkInTime,
          markedBy: attendance.markedBy,
        });
      }
    }
  } catch (error) {
    console.error('Error bulk saving attendance:', error);
    throw error;
  }
};

export const getAttendanceByDate = async (date: string): Promise<Attendance[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('date', '==', date));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Attendance));
  } catch (error) {
    console.error('Error getting attendance:', error);
    throw error;
  }
};

export const getAttendanceByChild = async (childId: string, startDate?: string, endDate?: string): Promise<Attendance[]> => {
  try {
    let q = query(collection(db, COLLECTION_NAME), where('childId', '==', childId));

    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Attendance));
  } catch (error) {
    console.error('Error getting child attendance:', error);
    throw error;
  }
};

export const updateAttendance = async (attendanceId: string, updates: Partial<Attendance>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, attendanceId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

// Get attendance for a date range
export const getAttendanceByDateRange = async (startDate: string, endDate: string): Promise<Attendance[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Attendance));
  } catch (error) {
    console.error('Error getting attendance by date range:', error);
    throw error;
  }
};

// Calculate stats from attendance records
export const calculateAttendanceStats = (records: Attendance[]): AttendanceStats => {
  const stats = {
    totalDays: records.length,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    attendanceRate: 0
  };

  records.forEach(record => {
    switch (record.status) {
      case 'present':
        stats.present++;
        break;
      case 'absent':
        stats.absent++;
        break;
      case 'late':
        stats.late++;
        break;
      case 'half-day':
        stats.halfDay++;
        break;
    }
  });

  // Calculate attendance rate (present + late + half-day count as attended)
  const attended = stats.present + stats.late + stats.halfDay;
  stats.attendanceRate = stats.totalDays > 0 ? Math.round((attended / stats.totalDays) * 100) : 0;

  return stats;
};

// Get daily attendance summary for a date range
export const getDailyAttendanceSummary = async (startDate: string, endDate: string): Promise<DailyAttendanceSummary[]> => {
  try {
    const records = await getAttendanceByDateRange(startDate, endDate);

    // Group by date
    const dateMap = new Map<string, Attendance[]>();
    records.forEach(record => {
      const existing = dateMap.get(record.date) || [];
      existing.push(record);
      dateMap.set(record.date, existing);
    });

    // Calculate summary for each date
    const summaries: DailyAttendanceSummary[] = [];
    dateMap.forEach((dayRecords, date) => {
      const stats = calculateAttendanceStats(dayRecords);
      summaries.push({
        date,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        halfDay: stats.halfDay,
        total: stats.totalDays,
        rate: stats.attendanceRate
      });
    });

    // Sort by date descending
    return summaries.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error getting daily attendance summary:', error);
    throw error;
  }
};

// Get overall attendance stats for a date range
export const getOverallAttendanceStats = async (startDate: string, endDate: string): Promise<AttendanceStats> => {
  try {
    const records = await getAttendanceByDateRange(startDate, endDate);
    return calculateAttendanceStats(records);
  } catch (error) {
    console.error('Error getting overall attendance stats:', error);
    throw error;
  }
};

// Get attendance stats grouped by child
export const getAttendanceStatsByChild = async (
  startDate: string,
  endDate: string,
  childrenData: { id: string; name: string }[]
): Promise<StudentAttendanceRecord[]> => {
  try {
    const records = await getAttendanceByDateRange(startDate, endDate);

    // Group by childId
    const childMap = new Map<string, Attendance[]>();
    records.forEach(record => {
      const existing = childMap.get(record.childId) || [];
      existing.push(record);
      childMap.set(record.childId, existing);
    });

    // Calculate stats for each child
    const studentRecords: StudentAttendanceRecord[] = [];
    childrenData.forEach(child => {
      const childRecords = childMap.get(child.id) || [];
      studentRecords.push({
        childId: child.id,
        childName: child.name,
        stats: calculateAttendanceStats(childRecords)
      });
    });

    // Sort by attendance rate (lowest first to highlight issues)
    return studentRecords.sort((a, b) => a.stats.attendanceRate - b.stats.attendanceRate);
  } catch (error) {
    console.error('Error getting attendance stats by child:', error);
    throw error;
  }
};

// Get weekly trend data
export const getWeeklyTrend = async (weeks: number = 4): Promise<{ week: string; rate: number }[]> => {
  try {
    const trends: { week: string; rate: number }[] = [];
    const today = new Date();

    for (let i = 0; i < weeks; i++) {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - (i * 7));

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const stats = await getOverallAttendanceStats(startStr, endStr);

      trends.unshift({
        week: `Week ${weeks - i}`,
        rate: stats.attendanceRate
      });
    }

    return trends;
  } catch (error) {
    console.error('Error getting weekly trend:', error);
    throw error;
  }
};
