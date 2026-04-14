import { getAttendanceByChild } from './attendanceService';
import { getActivitiesByChild } from './activityService';
import { getFeedPostsByChild } from './feedService';
import { getCheckInRecordsByChild } from './qrService';
import type { Attendance, DailyActivity, FeedPost, CheckInRecord, Child } from '../types/index';

export interface DailyReport {
  child: Child;
  date: string;
  attendance: Attendance | null;
  checkIns: CheckInRecord[];
  activities: DailyActivity | null;
  feedPosts: FeedPost[];
}

export const getDailyReport = async (child: Child, date: string): Promise<DailyReport> => {
  try {
    const [attendanceRecords, allActivities, allFeedPosts, checkIns] = await Promise.all([
      getAttendanceByChild(child.id, date, date),
      getActivitiesByChild(child.id, 10),
      getFeedPostsByChild(child.id, 20),
      getCheckInRecordsByChild(child.id, date),
    ]);

    // Find activity for the specific date
    const todayActivity = allActivities.find(a => a.date === date) || null;

    // Filter feed posts for the specific date
    const todayPosts = allFeedPosts.filter(p => {
      const postDate = new Date(p.createdAt).toISOString().split('T')[0];
      return postDate === date;
    });

    return {
      child,
      date,
      attendance: attendanceRecords[0] || null,
      checkIns,
      activities: todayActivity,
      feedPosts: todayPosts,
    };
  } catch (error) {
    console.error('Error getting daily report:', error);
    throw error;
  }
};
