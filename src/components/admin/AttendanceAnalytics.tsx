import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  RefreshCw,
  Download
} from 'lucide-react';
import {
  getDailyAttendanceSummary,
  getOverallAttendanceStats,
  getAttendanceStatsByChild,
  getWeeklyTrend,
  type AttendanceStats,
  type DailyAttendanceSummary,
  type StudentAttendanceRecord
} from '../../services/attendanceService';
import { getAllChildren } from '../../services/childrenService';

interface AttendanceAnalyticsProps {
  onBack: () => void;
}

type TimeRange = 'week' | 'month' | 'quarter';

const AttendanceAnalytics = ({ onBack }: AttendanceAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState<AttendanceStats | null>(null);
  const [dailySummary, setDailySummary] = useState<DailyAttendanceSummary[]>([]);
  const [studentRecords, setStudentRecords] = useState<StudentAttendanceRecord[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<{ week: string; rate: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'students'>('overview');

  const exportCSV = () => {
    if (activeTab === 'students' && studentRecords.length > 0) {
      const header = 'Student Name,Total Days,Present,Absent,Late,Half Day,Attendance Rate\n';
      const rows = studentRecords.map(r =>
        `"${r.childName}",${r.stats.totalDays},${r.stats.present},${r.stats.absent},${r.stats.late},${r.stats.halfDay},${r.stats.attendanceRate}%`
      ).join('\n');
      downloadCSV(header + rows, `attendance_students_${timeRange}.csv`);
    } else if (activeTab === 'daily' && dailySummary.length > 0) {
      const header = 'Date,Present,Absent,Late,Half Day,Total,Rate\n';
      const rows = dailySummary.map(d =>
        `${d.date},${d.present},${d.absent},${d.late},${d.halfDay},${d.total},${d.rate}%`
      ).join('\n');
      downloadCSV(header + rows, `attendance_daily_${timeRange}.csv`);
    } else if (overallStats) {
      const csv = `Metric,Value\nTotal Days,${overallStats.totalDays}\nPresent,${overallStats.present}\nAbsent,${overallStats.absent}\nLate,${overallStats.late}\nHalf Day,${overallStats.halfDay}\nAttendance Rate,${overallStats.attendanceRate}%`;
      downloadCSV(csv, `attendance_overview_${timeRange}.csv`);
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getDateRange = (range: TimeRange): { start: string; end: string } => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(timeRange);

      // Load all data in parallel
      const [stats, daily, children, trend] = await Promise.all([
        getOverallAttendanceStats(start, end),
        getDailyAttendanceSummary(start, end),
        getAllChildren(),
        getWeeklyTrend(4)
      ]);

      setOverallStats(stats);
      setDailySummary(daily);
      setWeeklyTrend(trend);

      // Get student-wise stats
      const childrenData = children.map(c => ({ id: c.id, name: c.name }));
      const studentStats = await getAttendanceStatsByChild(start, end, childrenData);
      setStudentRecords(studentStats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (rate: number): string => {
    if (rate >= 90) return '#10B981';
    if (rate >= 75) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusLabel = (rate: number): string => {
    if (rate >= 90) return 'Excellent';
    if (rate >= 75) return 'Good';
    if (rate >= 50) return 'Needs Attention';
    return 'Critical';
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <RefreshCw className="spin" size={32} />
        <p>Loading attendance analytics...</p>
      </div>
    );
  }

  return (
    <div className="attendance-analytics">
      {/* Header */}
      <div className="analytics-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={20} />
          Back
        </button>
        <h1>Attendance Analytics</h1>
        <button className="refresh-btn" onClick={exportCSV} title="Download CSV" style={{ marginRight: '8px' }}>
          <Download size={18} />
        </button>
        <button className="refresh-btn" onClick={loadAnalytics}>
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        <button
          className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
          onClick={() => setTimeRange('week')}
        >
          Last 7 Days
        </button>
        <button
          className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
          onClick={() => setTimeRange('month')}
        >
          Last Month
        </button>
        <button
          className={`range-btn ${timeRange === 'quarter' ? 'active' : ''}`}
          onClick={() => setTimeRange('quarter')}
        >
          Last 3 Months
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} />
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <Calendar size={18} />
          Daily
        </button>
        <button
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={18} />
          Students
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overallStats && (
        <div className="analytics-overview">
          {/* Main Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{overallStats.attendanceRate}%</span>
                <span className="stat-label">Attendance Rate</span>
              </div>
              <div
                className="stat-indicator"
                style={{ backgroundColor: getStatusColor(overallStats.attendanceRate) }}
              >
                {getStatusLabel(overallStats.attendanceRate)}
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{overallStats.present}</span>
                <span className="stat-label">Present</span>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">
                <XCircle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{overallStats.absent}</span>
                <span className="stat-label">Absent</span>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{overallStats.late}</span>
                <span className="stat-label">Late</span>
              </div>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className="trend-section">
            <h3>Weekly Attendance Trend</h3>
            <div className="trend-chart">
              {weeklyTrend.map((week, index) => (
                <div key={index} className="trend-bar-container">
                  <div className="trend-bar-wrapper">
                    <div
                      className="trend-bar"
                      style={{
                        height: `${week.rate}%`,
                        backgroundColor: getStatusColor(week.rate)
                      }}
                    />
                  </div>
                  <span className="trend-label">{week.week}</span>
                  <span className="trend-value">{week.rate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="breakdown-section">
            <h3>Attendance Breakdown</h3>
            <div className="breakdown-chart">
              <div className="breakdown-bar">
                <div
                  className="breakdown-segment present"
                  style={{ width: `${(overallStats.present / overallStats.totalDays) * 100}%` }}
                />
                <div
                  className="breakdown-segment late"
                  style={{ width: `${(overallStats.late / overallStats.totalDays) * 100}%` }}
                />
                <div
                  className="breakdown-segment half-day"
                  style={{ width: `${(overallStats.halfDay / overallStats.totalDays) * 100}%` }}
                />
                <div
                  className="breakdown-segment absent"
                  style={{ width: `${(overallStats.absent / overallStats.totalDays) * 100}%` }}
                />
              </div>
              <div className="breakdown-legend">
                <div className="legend-item">
                  <span className="legend-color present" />
                  <span>Present ({overallStats.present})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color late" />
                  <span>Late ({overallStats.late})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color half-day" />
                  <span>Half Day ({overallStats.halfDay})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color absent" />
                  <span>Absent ({overallStats.absent})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Tab */}
      {activeTab === 'daily' && (
        <div className="analytics-daily">
          <h3>Daily Attendance Summary</h3>
          {dailySummary.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No attendance data for this period</p>
            </div>
          ) : (
            <div className="daily-list">
              {dailySummary.map((day) => (
                <div key={day.date} className="daily-item">
                  <div className="daily-date">
                    <span className="date-main">{formatDate(day.date)}</span>
                  </div>
                  <div className="daily-stats">
                    <span className="daily-stat present">
                      <CheckCircle size={14} />
                      {day.present}
                    </span>
                    <span className="daily-stat absent">
                      <XCircle size={14} />
                      {day.absent}
                    </span>
                    <span className="daily-stat late">
                      <Clock size={14} />
                      {day.late}
                    </span>
                  </div>
                  <div
                    className="daily-rate"
                    style={{ color: getStatusColor(day.rate) }}
                  >
                    {day.rate}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="analytics-students">
          <h3>Student Attendance Report</h3>

          {/* Students needing attention */}
          {studentRecords.filter(s => s.stats.attendanceRate < 75).length > 0 && (
            <div className="attention-section">
              <div className="attention-header">
                <AlertCircle size={20} />
                <span>Students Needing Attention</span>
              </div>
              <div className="attention-list">
                {studentRecords
                  .filter(s => s.stats.attendanceRate < 75)
                  .map((student) => (
                    <div key={student.childId} className="attention-item">
                      <span className="student-name">{student.childName}</span>
                      <span
                        className="student-rate"
                        style={{ color: getStatusColor(student.stats.attendanceRate) }}
                      >
                        {student.stats.attendanceRate}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* All students list */}
          <div className="students-list">
            {studentRecords.map((student) => (
              <div key={student.childId} className="student-item">
                <div className="student-info">
                  <span className="student-name">{student.childName}</span>
                  <div className="student-breakdown">
                    <span className="mini-stat present">P: {student.stats.present}</span>
                    <span className="mini-stat absent">A: {student.stats.absent}</span>
                    <span className="mini-stat late">L: {student.stats.late}</span>
                  </div>
                </div>
                <div className="student-rate-container">
                  <div className="rate-bar-bg">
                    <div
                      className="rate-bar-fill"
                      style={{
                        width: `${student.stats.attendanceRate}%`,
                        backgroundColor: getStatusColor(student.stats.attendanceRate)
                      }}
                    />
                  </div>
                  <span
                    className="student-rate"
                    style={{ color: getStatusColor(student.stats.attendanceRate) }}
                  >
                    {student.stats.attendanceRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceAnalytics;
