import { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PendingApproval from './components/auth/PendingApproval';
import UserApproval from './components/admin/UserApproval';
import CreateUser from './components/admin/CreateUser';
import CreateStudent from './components/admin/CreateStudent';
import ImportStudents from './components/admin/ImportStudents';
import StudentsPage from './components/admin/StudentsPage';
import FeeAnalytics from './components/admin/FeeAnalytics';
import ManageUsers from './components/admin/ManageUsers';
import AttendanceAnalytics from './components/admin/AttendanceAnalytics';
import QRAnalytics from './components/admin/QRAnalytics';
import ParentConcernParent from './components/parent/ParentConcern';
import ParentConcernTeacher from './components/teacher/ParentConcern';
import ParentConcernAdmin from './components/admin/ParentConcern';
import CreateAnnouncement from './components/admin/CreateAnnouncement';
import AddGalleryPhoto from './components/admin/AddGalleryPhoto';
import FeeManager from './components/admin/FeeManager';
import ClassUpdateForm from './components/teacher/ClassUpdate';
import ClassUpdatesView from './components/parent/ClassUpdates';
import AdminClassUpdates from './components/admin/ClassUpdates';
import ChildProfile from './components/shared/ChildProfile';
import StudentReportView from './components/parent/StudentReport';
import TeacherStudentReport from './components/teacher/StudentReport';
import AdminStudentReport from './components/admin/StudentReport';
import GalleryPage from './components/parent/GalleryPage';
import CalendarPage from './components/parent/CalendarPage';
import MessagesPage from './components/shared/MessagesPage';
import Assignments from './components/teacher/Assignments';
import LessonPlanner from './components/teacher/LessonPlanner';
import FeedPostCreator from './components/teacher/FeedPostCreator';
import QRCodeDisplay from './components/teacher/QRCodeDisplay';
import QRScanner from './components/parent/QRScanner';
import DailyReportPage from './components/parent/DailyReport';
import ProfilePage from './components/shared/ProfilePage';
import {
  Home,
  Calendar,
  MessageSquare,
  Bell,
  User,
  CheckCircle,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Camera,
  Heart,
  UserCheck,
  UserPlus,
  TrendingUp,
  Settings,
  FileSpreadsheet,
  Lock,
  BarChart3,
  FileEdit,
  QrCode,
  Rss,
  FileBarChart,
  IndianRupee,
  Shield,
} from 'lucide-react';
import { mockClasses, mockLessonPlans } from './data/mockData';
import { bulkSaveAttendance, getAttendanceByDate } from './services/attendanceService';
import { generateGPayLink, getFeePaymentsByChild, getAllPendingPayments } from './services/feeService';
import { getAllChildren, getChildrenByParent } from './services/childrenService';
import { getAllTeachers } from './services/teacherService';
import { getAllAnnouncements } from './services/announcementService';
import { getActivitiesByChild } from './services/activityService';
import type { Child, DailyActivity, Announcement } from './types/index';
import type { Teacher } from './services/teacherService';

// Login Screen Component
const LoginScreen = () => {
  const { signInWithEmail, resetPassword, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      let emailToUse = username.trim();
      if (!emailToUse.includes('@')) {
        emailToUse = `${emailToUse}@mayurischool.com`;
      }
      await signInWithEmail(emailToUse, password);
    } catch {
      // error is already set by signInWithEmail in AuthContext
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-logo">
        <img src="/images/logo.png" alt="Mayuri" />
      </div>
      <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, margin: '0 0 4px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>Mayuri</h1>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', margin: '0 0 16px', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>Kids Villa</p>

      <div className="login-card">
        <form onSubmit={handleLogin} className="email-login-form">
          <div className="input-with-icon">
            <User size={20} className="input-icon" />
            <input
              type="text"
              placeholder="Userid (e.g. mkp-lkg-01) or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <small style={{ display: 'block', marginTop: '-8px', marginBottom: '12px', color: '#888', fontSize: '12px' }}>
            Parents: use the userid the school gave you (e.g. mkp-lkg-01)
          </small>
          <div className="input-with-icon">
            <Lock size={20} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block login-btn" disabled={loginLoading}>
            <span>{loginLoading ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>

        {error && (
          <p style={{ color: '#f44336', marginTop: '12px', fontSize: '14px', textAlign: 'center' }}>
            {error.includes('invalid-credential') || error.includes('wrong-password') || error.includes('user-not-found')
              ? 'Invalid username or password'
              : error.includes('too-many-requests')
              ? 'Too many attempts. Please try again later.'
              : error}
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowForgot(true)}
          style={{ background: 'none', border: 'none', color: '#00897B', fontSize: '13px', cursor: 'pointer', marginTop: '12px', width: '100%', textAlign: 'center' }}
        >
          Forgot Password?
        </button>

        {showForgot && (
          <div style={{ marginTop: '12px', padding: '14px', background: '#f5f0ff', borderRadius: '10px' }}>
            {resetSent ? (
              <p style={{ color: '#4CAF50', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                Password reset email sent! Check your inbox.
              </p>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#555', margin: '0 0 8px' }}>
                  Enter your email above and we'll send a reset link:
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!username.trim()) { alert('Enter your username first'); return; }
                    try {
                      const email = username.includes('@') ? username : username.trim() + '@mayurischool.com';
                      await resetPassword(email);
                      setResetSent(true);
                    } catch { /* error shown via context */ }
                  }}
                  style={{ width: '100%', padding: '8px', background: '#00897B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Send Reset Link
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Parent Dashboard
const ParentDashboard = ({ setCurrentPage, children, activities, announcements }: { setCurrentPage: (page: string) => void; children: Child[]; activities: DailyActivity[]; announcements: Announcement[] }) => {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const child = children[selectedChildIndex] || children[0];
  const childClass = mockClasses.find(c => c.id === child?.classId);
  const todayActivity = activities[0];

  if (!child) {
    return (
      <div className="content">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>No student records found. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', padding: '0 16px 8px', overflowX: 'auto' }}>
          {children.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedChildIndex(i)}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: i === selectedChildIndex ? '#00897B' : '#f0f0f0',
                color: i === selectedChildIndex ? 'white' : '#333',
                fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >
              {c.gender === 'male' ? '👦' : '👧'} {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Child Card */}
      <div className="child-card">
        <div className="child-avatar">{child.gender === 'male' ? '👦' : '👧'}</div>
        <div className="child-info">
          <h3>{child.name}</h3>
          <p>{childClass?.name} • {childClass?.ageGroup}</p>
        </div>
        <div className="child-status present">Present</div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action" onClick={() => setCurrentPage('attendance')}>
          <div className="quick-action-icon attendance">
            <CheckCircle size={24} />
          </div>
          <span className="quick-action-label">Attendance</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('messages')}>
          <div className="quick-action-icon messages">
            <MessageSquare size={24} />
          </div>
          <span className="quick-action-label">Messages</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('fees')}>
          <div className="quick-action-icon fees">
            <CreditCard size={24} />
          </div>
          <span className="quick-action-label">Fees</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('announcements')}>
          <div className="quick-action-icon announcements">
            <Bell size={24} />
          </div>
          <span className="quick-action-label">Announcements</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('calendar')}>
          <div className="quick-action-icon calendar">
            <Calendar size={24} />
          </div>
          <span className="quick-action-label">Calendar</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('reports')}>
          <div className="quick-action-icon reports">
            <FileText size={24} />
          </div>
          <span className="quick-action-label">Reports</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('gallery')}>
          <div className="quick-action-icon gallery">
            <Camera size={24} />
          </div>
          <span className="quick-action-label">Gallery</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('qr-scan')}>
          <div className="quick-action-icon qr">
            <QrCode size={24} />
          </div>
          <span className="quick-action-label">Check In</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('daily-report')}>
          <div className="quick-action-icon daily-report">
            <FileBarChart size={24} />
          </div>
          <span className="quick-action-label">Daily Report</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('class-updates')}>
          <div className="quick-action-icon daily-report">
            <FileBarChart size={24} />
          </div>
          <span className="quick-action-label">Class Updates</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('concerns')}>
          <div className="quick-action-icon messages">
            <MessageSquare size={24} />
          </div>
          <span className="quick-action-label">Concerns</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('child-profile')}>
          <div className="quick-action-icon child-profile">
            <Shield size={24} />
          </div>
          <span className="quick-action-label">Child Info</span>
        </button>
      </div>

      {/* Today's Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Today's Activity</h3>
          <span className="card-subtitle">Updated 10 min ago</span>
        </div>
        <div className="activity-feed">
          {todayActivity?.meals.map((meal, index) => (
            <div className="activity-item" key={index}>
              <div className="activity-icon meal">🍽️</div>
              <div className="activity-content">
                <div className="activity-title">{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</div>
                <div className="activity-description">{meal.items} - {meal.consumption}</div>
              </div>
              <div className="activity-time">{meal.time}</div>
            </div>
          ))}
          {todayActivity?.napTime.map((nap, index) => (
            <div className="activity-item" key={index}>
              <div className="activity-icon nap">😴</div>
              <div className="activity-content">
                <div className="activity-title">Nap Time</div>
                <div className="activity-description">Slept well - {nap.quality}</div>
              </div>
              <div className="activity-time">{nap.startTime} - {nap.endTime}</div>
            </div>
          ))}
          {todayActivity?.activities.slice(0, 2).map((activity, index) => (
            <div className="activity-item" key={index}>
              <div className="activity-icon activity">🎨</div>
              <div className="activity-content">
                <div className="activity-title">{activity.activity}</div>
                <div className="activity-description">{activity.description}</div>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Announcements</h3>
        </div>
        {announcements.slice(0, 2).map((ann) => (
          <div className={`announcement-item ${ann.priority}`} key={ann.id}>
            <div className="announcement-title">{ann.title}</div>
            <div className="announcement-content">{ann.content.substring(0, 100)}...</div>
            <div className="announcement-meta">
              {new Date(ann.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Teacher Dashboard
const TeacherDashboard = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const teacherClass = mockClasses[0];
  const todayPlan = mockLessonPlans[0];

  return (
    <div className="content">
      {/* Class Card */}
      <div className="child-card">
        <div className="child-avatar">📚</div>
        <div className="child-info">
          <h3>{teacherClass.name}</h3>
          <p>{teacherClass.currentStrength} students • {teacherClass.ageGroup}</p>
        </div>
        <div className="child-status present">{teacherClass.currentStrength - 2} Present</div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action" onClick={() => setCurrentPage('mark-attendance')}>
          <div className="quick-action-icon attendance">
            <CheckCircle size={24} />
          </div>
          <span className="quick-action-label">Mark Attendance</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('assignments')}>
          <div className="quick-action-icon assignments-icon">
            <FileEdit size={24} />
          </div>
          <span className="quick-action-label">Assignments</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('planner')}>
          <div className="quick-action-icon planner">
            <BookOpen size={24} />
          </div>
          <span className="quick-action-label">Planner</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('messages')}>
          <div className="quick-action-icon messages">
            <MessageSquare size={24} />
          </div>
          <span className="quick-action-label">Messages</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('students')}>
          <div className="quick-action-icon students">
            <Users size={24} />
          </div>
          <span className="quick-action-label">Students</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('students')}>
          <div className="quick-action-icon health">
            <Heart size={24} />
          </div>
          <span className="quick-action-label">Health Info</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('gallery')}>
          <div className="quick-action-icon gallery">
            <Camera size={24} />
          </div>
          <span className="quick-action-label">Photos</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('concerns')}>
          <div className="quick-action-icon messages">
            <MessageSquare size={24} />
          </div>
          <span className="quick-action-label">Concerns</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('announcements')}>
          <div className="quick-action-icon announcements">
            <Bell size={24} />
          </div>
          <span className="quick-action-label">Announcements</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('create-feed-post')}>
          <div className="quick-action-icon feed">
            <Rss size={24} />
          </div>
          <span className="quick-action-label">Post Update</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('qr-display')}>
          <div className="quick-action-icon qr">
            <QrCode size={24} />
          </div>
          <span className="quick-action-label">QR Check-in</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('class-update')}>
          <div className="quick-action-icon daily-report">
            <FileBarChart size={24} />
          </div>
          <span className="quick-action-label">Class Update</span>
        </button>
      </div>

      {/* Today's Plan */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Today's Plan: {todayPlan?.theme}</h3>
        </div>
        <div className="lesson-timeline">
          {todayPlan?.activities.slice(0, 5).map((activity, index) => (
            <div className="lesson-item" key={index}>
              <div className="lesson-time">{activity.time}</div>
              <div className="lesson-content">
                <div className="lesson-title">{activity.name}</div>
                <div className="lesson-description">{activity.description}</div>
                <div className="lesson-tags">
                  {activity.skills.map((skill, i) => (
                    <span className="lesson-tag" key={i}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ setCurrentPage, children, teachers, announcements: _announcements }: { setCurrentPage: (page: string) => void; children: Child[]; teachers: Teacher[]; announcements: Announcement[] }) => {
  const [pendingPayments, setPendingPayments] = useState<import('./types/index').FeePayment[]>([]);

  useEffect(() => {
    getAllPendingPayments().then(setPendingPayments).catch(console.error);
  }, []);

  const totalStudents = children.length;
  const totalTeachers = teachers.length;
  const pendingFees = pendingPayments.length;
  const presentToday = Math.floor(totalStudents * 0.9);

  return (
    <div className="content">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{presentToday}</div>
          <div className="stat-label">Present Today</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{pendingFees}</div>
          <div className="stat-label">Pending Fees</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{totalTeachers}</div>
          <div className="stat-label">Staff Members</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action" onClick={() => setCurrentPage('fee-analytics')}>
          <div className="quick-action-icon analytics">
            <TrendingUp size={24} />
          </div>
          <span className="quick-action-label">Fee Analytics</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('fee-manager')}>
          <div className="quick-action-icon fees">
            <IndianRupee size={24} />
          </div>
          <span className="quick-action-label">Manage Fees</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('create-student')}>
          <div className="quick-action-icon create-user">
            <UserPlus size={24} />
          </div>
          <span className="quick-action-label">Add Student</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('create-user')}>
          <div className="quick-action-icon students">
            <Users size={24} />
          </div>
          <span className="quick-action-label">Add Teacher</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('import-students')}>
          <div className="quick-action-icon import-students">
            <FileSpreadsheet size={24} />
          </div>
          <span className="quick-action-label">Import Students</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('manage-users')}>
          <div className="quick-action-icon manage-users">
            <Settings size={24} />
          </div>
          <span className="quick-action-label">Manage Users</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('user-approvals')}>
          <div className="quick-action-icon staff">
            <UserCheck size={24} />
          </div>
          <span className="quick-action-label">Approvals</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('students')}>
          <div className="quick-action-icon students">
            <Users size={24} />
          </div>
          <span className="quick-action-label">Students</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('fees')}>
          <div className="quick-action-icon fees">
            <CreditCard size={24} />
          </div>
          <span className="quick-action-label">Fees</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('attendance')}>
          <div className="quick-action-icon attendance">
            <CheckCircle size={24} />
          </div>
          <span className="quick-action-label">Attendance</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('attendance-analytics')}>
          <div className="quick-action-icon attendance-analytics">
            <BarChart3 size={24} />
          </div>
          <span className="quick-action-label">Analytics</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('create-announcement')}>
          <div className="quick-action-icon announcements">
            <Bell size={24} />
          </div>
          <span className="quick-action-label">Send Announcement</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('add-gallery-photo')}>
          <div className="quick-action-icon gallery">
            <Camera size={24} />
          </div>
          <span className="quick-action-label">Add Gallery Photo</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('reports')}>
          <div className="quick-action-icon reports">
            <FileText size={24} />
          </div>
          <span className="quick-action-label">Reports</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('assignments')}>
          <div className="quick-action-icon assignments-icon">
            <FileEdit size={24} />
          </div>
          <span className="quick-action-label">Assignments</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('qr-analytics')}>
          <div className="quick-action-icon qr">
            <QrCode size={24} />
          </div>
          <span className="quick-action-label">QR Check-in</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('concerns')}>
          <div className="quick-action-icon messages">
            <MessageSquare size={24} />
          </div>
          <span className="quick-action-label">Concerns</span>
        </button>
        <button className="quick-action" onClick={() => setCurrentPage('class-updates')}>
          <div className="quick-action-icon daily-report">
            <FileBarChart size={24} />
          </div>
          <span className="quick-action-label">Class Updates</span>
        </button>
      </div>

      {/* Fee Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Fee Collection</h3>
        </div>
        <div className="fee-list">
          {pendingPayments.slice(0, 3).map((payment) => {
            const child = children.find((c: Child) => c.id === payment.childId);
            return (
              <div className="fee-item" key={payment.id}>
                <div className="fee-info">
                  <h4>{child?.name || 'Unknown'}</h4>
                  <p>Due: {payment.dueDate}</p>
                </div>
                <div className="fee-amount">
                  <div className="amount">₹{payment.amount}</div>
                  <span className={`fee-status ${payment.status}`}>{payment.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Staff</h3>
        </div>
        {teachers.map((teacher) => (
          <div className="list-item" key={teacher.id}>
            <div className="list-avatar">👩‍🏫</div>
            <div className="list-info">
              <div className="list-name">{teacher.name}</div>
              <div className="list-detail">{teacher.email}</div>
            </div>
            <div className="list-action">
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Attendance Page (Teacher/Admin can mark, Parent can view)
const AttendancePage = ({ onBack, children }: { onBack: () => void; children: Child[] }) => {
  const { user } = useAuth();
  const [date] = useState(new Date());
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user can mark attendance (only teachers and admins)
  const canMarkAttendance = user?.role === 'teacher' || user?.role === 'admin';

  // Load existing attendance data for the selected date
  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const today = date.toISOString().split('T')[0];
        const attendanceData = await getAttendanceByDate(today);

        // Convert array to object for easier state management
        const attendanceMap: Record<string, string> = {};
        attendanceData.forEach(record => {
          attendanceMap[record.childId] = record.status;
        });
        setAttendance(attendanceMap);
      } catch (error) {
        console.error('Error loading attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [date]);

  const toggleAttendance = (childId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [childId]: prev[childId] === status ? '' : status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const today = date.toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      // Convert attendance — unmarked children default to ABSENT
      const attendanceRecords = children.map(child => {
        const status = attendance[child.id] || 'absent';
        return {
          childId: child.id,
          date: today,
          status: status as 'present' | 'absent' | 'late' | 'half-day',
          ...(status === 'present' || status === 'late' ? { checkInTime: currentTime } : {}),
          markedBy: user.id,
        };
      });

      // Save to Firebase
      await bulkSaveAttendance(attendanceRecords);

      setSaved(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: 'white',
            fontSize: '48px'
          }}>
            ✓
          </div>
          <h2>Attendance Saved!</h2>
          <p>Attendance has been successfully recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">{canMarkAttendance ? 'Mark Attendance' : 'View Attendance'}</h2>
      </div>

      <div className="attendance-date">
        <button><ChevronLeft size={20} /></button>
        <span>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        <button><ChevronRight size={20} /></button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading attendance data...
        </div>
      ) : (
        <div className="attendance-list">
          {(() => {
            // Sort children by class order (Pre-KG → LKG → UKG), then by admission
            // number / name within each class, so the roster lines up with the
            // teacher's physical class lists.
            const classOrder: Record<string, number> = { 'class-1': 1, 'class-2': 2, 'class-3': 3 };
            const sorted = [...children].sort((a, b) => {
              const ca = classOrder[a.classId] ?? 99;
              const cb = classOrder[b.classId] ?? 99;
              if (ca !== cb) return ca - cb;
              const aa = a.admissionNumber || '';
              const ab = b.admissionNumber || '';
              if (aa && ab) return aa.localeCompare(ab, undefined, { numeric: true });
              return a.name.localeCompare(b.name);
            });
            const rendered: React.ReactNode[] = [];
            let lastClassId: string | null = null;
            sorted.forEach(child => {
              if (child.classId !== lastClassId) {
                lastClassId = child.classId;
                rendered.push(
                  <div
                    key={`hdr-${child.classId}`}
                    style={{
                      padding: '10px 16px',
                      background: '#f5f5f5',
                      color: '#555',
                      fontWeight: 600,
                      fontSize: '13px',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {mockClasses.find(c => c.id === child.classId)?.name || child.classId}
                  </div>
                );
              }
              rendered.push(
          <div className="attendance-item" key={child.id}>
            <div className="attendance-avatar">
              {child.gender === 'male' ? '👦' : '👧'}
            </div>
            <div className="attendance-info">
              <div className="attendance-name">{child.name}</div>
              <div className="attendance-class">
                {mockClasses.find(c => c.id === child.classId)?.name}
              </div>
            </div>
            {canMarkAttendance ? (
              <div className="attendance-status">
                <button
                  className={`status-btn present ${attendance[child.id] === 'present' ? 'active' : ''}`}
                  onClick={() => toggleAttendance(child.id, 'present')}
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  className={`status-btn absent ${attendance[child.id] === 'absent' ? 'active' : ''}`}
                  onClick={() => toggleAttendance(child.id, 'absent')}
                >
                  <X size={18} />
                </button>
                <button
                  className={`status-btn late ${attendance[child.id] === 'late' ? 'active' : ''}`}
                  onClick={() => toggleAttendance(child.id, 'late')}
                >
                  <Clock size={18} />
                </button>
              </div>
            ) : (
              <div className="attendance-status" style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {attendance[child.id] === 'present' && (
                  <span style={{ color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={18} /> Present
                  </span>
                )}
                {attendance[child.id] === 'absent' && (
                  <span style={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={18} /> Absent
                  </span>
                )}
                {attendance[child.id] === 'late' && (
                  <span style={{ color: '#ff9800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={18} /> Late
                  </span>
                )}
                {!attendance[child.id] && (
                  <span style={{ color: '#999' }}>Not marked</span>
                )}
              </div>
            )}
          </div>
              );
            });
            return rendered;
          })()}
        </div>
      )}

      {!loading && canMarkAttendance && (
        <div style={{ padding: '16px' }}>
          <button
            className="btn btn-primary btn-block"
            onClick={handleSaveAttendance}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
};

// Announcements Page
const AnnouncementsPage = ({ onBack, announcements: _announcements, children: childrenProp }: { onBack: () => void; announcements: Announcement[]; children?: Child[] }) => {
  const { user } = useAuth();
  const [localAnns, setLocalAnns] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  // Always load fresh announcements
  useEffect(() => {
    getAllAnnouncements(50).then(data => { setLocalAnns(data); setAnnLoading(false); }).catch(() => setAnnLoading(false));
  }, []);

  // Filter: parents see only relevant announcements
  const filtered = localAnns.filter(ann => {
    if (user?.role !== 'parent') return true;
    if (ann.targetAudience === 'all' || ann.targetAudience === 'parents') return true;
    if (ann.targetAudience === 'class' && childrenProp) {
      return childrenProp.some(c => c.classId === ann.targetClassId);
    }
    return ann.targetAudience !== 'teachers';
  });

  const handleDelete = async (annId: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('./config/firebase');
      await deleteDoc(doc(db, 'announcements', annId));
      setLocalAnns(prev => prev.filter(a => a.id !== annId));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      // Handle Firestore Timestamp objects
      if (typeof dateStr === 'object' && dateStr !== null) {
        const ts = dateStr as { seconds?: number };
        if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
      }
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Announcements</h2>
      </div>

      {annLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No announcements</div>
      ) : filtered.map((ann) => (
        <div className={`announcement-item ${ann.priority}`} key={ann.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="announcement-title">{ann.title}</div>
            {isAdmin && (
              <button onClick={() => handleDelete(ann.id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: '4px', fontSize: '18px' }}>×</button>
            )}
          </div>
          <div className="announcement-content">{ann.content}</div>
          <div className="announcement-meta">
            {formatDate(ann.createdAt)}
            {ann.targetAudience === 'class' && <span> • Class specific</span>}
            {ann.targetAudience === 'teachers' && <span> • Teachers only</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

// Fees Page (Parent)
const FeesPage = ({ onBack, children: childrenProp }: { onBack: () => void; children: Child[] }) => {
  const child = childrenProp[0];
  const [childPayments, setChildPayments] = useState<import('./types/index').FeePayment[]>([]);
  const [feesLoading, setFeesLoading] = useState(true);
  const [schoolUpiId, setSchoolUpiId] = useState('mayuri@oksbi');

  useEffect(() => {
    if (!child) return;
    const loadFees = async () => {
      setFeesLoading(true);
      try {
        const payments = await getFeePaymentsByChild(child.id);
        setChildPayments(payments.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || '')));
        // Load UPI ID from fee config
        const { getFeeConfig } = await import('./services/feeService');
        const cfg = await getFeeConfig(child.classId);
        if (cfg?.upiId) setSchoolUpiId(cfg.upiId);
      } catch (error) {
        console.error('Error loading fees:', error);
      } finally {
        setFeesLoading(false);
      }
    };
    loadFees();
  }, [child]);

  const handlePayNow = (payment: import('./types/index').FeePayment) => {
    const gpayLink = generateGPayLink(
      schoolUpiId,
      payment.amount,
      'Mayuri Playschool',
      `Fee Payment for ${child.name} - ${new Date(payment.dueDate).toLocaleDateString()}`
    );

    // Open GPay link
    window.location.href = gpayLink;
  };

  if (feesLoading) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
          <h2 className="page-title">Fee Payments</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading fee data...</div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Fee Payments</h2>
      </div>

      <div className="fee-summary-card">
        <div className="fee-summary-header">
          <div>
            <h3>Total Pending</h3>
            <p className="fee-summary-amount">
              ₹{childPayments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0)}
            </p>
          </div>
          <div className="fee-summary-icon">💰</div>
        </div>
      </div>

      <div className="fee-list-container">
        {childPayments.map((payment) => (
          <div className="fee-card" key={payment.id}>
            <div className="fee-card-header">
              <div className="fee-card-info">
                <h4>Monthly Tuition Fee</h4>
                <p className="fee-card-date">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
              </div>
              <span className={`fee-badge ${payment.status}`}>
                {payment.status}
              </span>
            </div>
            <div className="fee-card-body">
              <div className="fee-card-amount">₹{payment.amount}</div>
              {payment.status !== 'paid' ? (
                <button
                  className="btn-pay-now"
                  onClick={() => handlePayNow(payment)}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M3.5 5.25h17a.75.75 0 0 1 0 1.5h-17a.75.75 0 0 1 0-1.5zm0 6h17a.75.75 0 0 1 0 1.5h-17a.75.75 0 0 1 0-1.5zm0 6h17a.75.75 0 0 1 0 1.5h-17a.75.75 0 0 1 0-1.5z"/>
                  </svg>
                  Pay with GPay
                </button>
              ) : (
                <div className="payment-success">
                  <CheckCircle size={20} />
                  <span>Paid on {payment.paidDate && new Date(payment.paidDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            {payment.receiptNumber && (
              <div className="fee-card-footer">
                Receipt: {payment.receiptNumber}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="payment-info">
        <h4>Payment Information</h4>
        <p><strong>UPI ID:</strong> {schoolUpiId}</p>
        <p><strong>Beneficiary:</strong> Mayuri Playschool</p>
        <p className="payment-note">
          After payment, please share the transaction screenshot with the admin for verification.
        </p>
      </div>
    </div>
  );
};

// Create User Page (Admin)
const CreateUserPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Create User</h2>
      </div>
      <CreateUser onBack={onBack} />
    </div>
  );
};

// Fee Analytics Page (Admin)
const FeeAnalyticsPage = ({ onBack }: { onBack: () => void }) => {
  return <FeeAnalytics onBack={onBack} />;
};

// User Approval Page (Admin)
const UserApprovalPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">User Approvals</h2>
      </div>
      <UserApproval />
    </div>
  );
};

// Loading Screen Component
const LoadingScreen = () => (
  <div className="login-screen">
    <div className="login-logo">
      <img src="/images/logo.png" alt="Mayuri Kids Villa" />
    </div>
    <p className="login-subtitle">Loading...</p>
  </div>
);

// Main App with Navigation
const MainApp = () => {
  const { user, loading } = useAuth();
  // Auto-open check-in page if ?action=checkin in URL (from QR scan)
  const initialPage = new URLSearchParams(window.location.search).get('action') === 'checkin' ? 'qr-scan' : 'home';
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [activeNav, setActiveNav] = useState(initialPage === 'qr-scan' ? 'home' : 'home');

  // Real data state
  const [children, setChildren] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [_dataLoading, setDataLoading] = useState(true);

  // Request notification permission on login
  useEffect(() => {
    if (!user) return;
    import('./services/notificationService').then(({ requestNotificationPermission }) => {
      requestNotificationPermission(user.id).catch(() => {});
    });
  }, [user]);

  // Load real data from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);

        // Parallel data loading for speed
        const announcementsPromise = getAllAnnouncements(10);
        const teachersPromise = (user.role === 'admin' || user.role === 'teacher')
          ? getAllTeachers() : Promise.resolve([]);

        let childrenData: Child[] = [];

        if (user.role === 'parent') {
          childrenData = await getChildrenByParent(user.id);
        } else if (user.role === 'teacher') {
          const allChildren = await getAllChildren();
          const teacherUser = user as typeof user & { assignedClasses?: string[] };
          childrenData = allChildren.filter(child =>
            teacherUser.assignedClasses && teacherUser.assignedClasses.includes(child.classId)
          );
        } else {
          childrenData = await getAllChildren();
        }

        setChildren(childrenData);

        // Load activities for parent's first child in parallel with other fetches
        if (user.role === 'parent' && childrenData.length > 0) {
          const activitiesData = await getActivitiesByChild(childrenData[0].id);
          setActivities(activitiesData);
        }

        const [announcementsData, teachersData] = await Promise.all([
          announcementsPromise, teachersPromise
        ]);
        setAnnouncements(announcementsData);
        setTeachers(teachersData);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;

  // Check if user needs approval (new users who aren't approved yet)
  // Admins bypass this check, and mock users (pre-approved) also bypass
  if (user.approvalStatus === 'pending' || user.approvalStatus === 'rejected') {
    return <PendingApproval />;
  }

  const isAdmin = user.role === 'admin';
  const isTeacher = user.role === 'teacher';
  const isTeacherOrAdmin = isAdmin || isTeacher;

  const renderPage = () => {
    switch (currentPage) {
      case 'mark-attendance':
      case 'attendance':
        return <AttendancePage onBack={() => setCurrentPage('home')} children={children} />;
      case 'messages':
        return <MessagesPage onBack={() => setCurrentPage('home')} />;
      case 'announcements':
        return <AnnouncementsPage key={Date.now()} onBack={() => setCurrentPage('home')} announcements={announcements} children={children} />;
      case 'create-announcement':
        if (!isTeacherOrAdmin) { setCurrentPage('home'); return null; }
        return <CreateAnnouncement onBack={() => setCurrentPage('home')} />;
      case 'add-gallery-photo':
        if (!isTeacherOrAdmin) { setCurrentPage('home'); return null; }
        return <AddGalleryPhoto onBack={() => setCurrentPage('home')} />;
      case 'fees':
        return <FeesPage onBack={() => setCurrentPage('home')} children={children} />;
      case 'calendar':
        return <CalendarPage onBack={() => setCurrentPage('home')} />;
      case 'reports':
        if (user.role === 'admin') {
          return <AdminStudentReport onBack={() => setCurrentPage('home')} />;
        }
        if (user.role === 'teacher') {
          return <TeacherStudentReport onBack={() => setCurrentPage('home')} />;
        }
        return children[0] ? <StudentReportView onBack={() => setCurrentPage('home')} child={children[0]} /> : <div>No student found</div>;
      case 'gallery':
        return <GalleryPage onBack={() => setCurrentPage('home')} />;
      case 'fee-analytics':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <FeeAnalyticsPage onBack={() => setCurrentPage('home')} />;
      case 'fee-manager':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <FeeManager onBack={() => setCurrentPage('home')} />;
      case 'create-user':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <CreateUserPage onBack={() => setCurrentPage('home')} />;
      case 'create-student':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <CreateStudent onBack={() => setCurrentPage('home')} />;
      case 'import-students':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <ImportStudents onBack={() => setCurrentPage('home')} />;
      case 'students':
        if (!isTeacherOrAdmin) { setCurrentPage('home'); return null; }
        return <StudentsPage onBack={() => setCurrentPage('home')} />;
      case 'user-approvals':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <UserApprovalPage onBack={() => setCurrentPage('home')} />;
      case 'manage-users':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <ManageUsers onBack={() => setCurrentPage('home')} />;
      case 'attendance-analytics':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <AttendanceAnalytics onBack={() => setCurrentPage('home')} />;
      case 'qr-analytics':
        if (!isAdmin) { setCurrentPage('home'); return null; }
        return <QRAnalytics onBack={() => setCurrentPage('home')} />;
      case 'concerns':
        if (user.role === 'admin') return <ParentConcernAdmin onBack={() => setCurrentPage('home')} />;
        if (user.role === 'teacher') return <ParentConcernTeacher onBack={() => setCurrentPage('home')} />;
        return <ParentConcernParent onBack={() => setCurrentPage('home')} children={children} />;
      case 'assignments':
        if (!isTeacherOrAdmin) { setCurrentPage('home'); return null; }
        return <Assignments onBack={() => setCurrentPage('home')} />;
      case 'planner':
        if (!isTeacherOrAdmin) { setCurrentPage('home'); return null; }
        return <LessonPlanner onBack={() => setCurrentPage('home')} />;
      case 'create-feed-post':
        if (!isTeacherOrAdmin) { setCurrentPage('home'); return null; }
        return <FeedPostCreator onBack={() => setCurrentPage('home')} children={children} />;
      case 'qr-display':
        if (!isTeacherOrAdmin) { setCurrentPage('home'); return null; }
        return <QRCodeDisplay onBack={() => setCurrentPage('home')} />;
      case 'qr-scan':
        return <QRScanner onBack={() => setCurrentPage('home')} children={children} />;
      case 'daily-report':
        return <DailyReportPage onBack={() => setCurrentPage('home')} children={children} />;
      case 'class-update':
        if (!isTeacherOrAdmin) { setCurrentPage('home'); return null; }
        return <ClassUpdateForm onBack={() => setCurrentPage('home')} />;
      case 'class-updates':
        if (user.role === 'admin') return <AdminClassUpdates onBack={() => setCurrentPage('home')} />;
        return <ClassUpdatesView onBack={() => setCurrentPage('home')} children={children} />;
      case 'child-profile':
        return children[0] ? <ChildProfile onBack={() => setCurrentPage('home')} child={children[0]} /> : <div className="content"><p style={{padding:'40px',textAlign:'center'}}>No student found</p></div>;
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('home')} />;
      default:
        if (user.role === 'parent') return <ParentDashboard setCurrentPage={setCurrentPage} children={children} activities={activities} announcements={announcements} />;
        if (user.role === 'teacher') return <TeacherDashboard setCurrentPage={setCurrentPage} />;
        if (user.role === 'admin') return <AdminDashboard setCurrentPage={setCurrentPage} children={children} teachers={teachers} announcements={announcements} />;
        return <ParentDashboard setCurrentPage={setCurrentPage} children={children} activities={activities} announcements={announcements} />;
    }
  };

  const getRoleTitle = () => {
    switch (user.role) {
      case 'parent': return 'Parent Dashboard';
      case 'teacher': return 'Teacher Dashboard';
      case 'admin': return 'Admin Dashboard';
      default: return 'Mayuri';
    }
  };

  return (
    <div className="app-container">
      <div className="main-layout">
        {/* Header */}
        <header className="header">
          <div className="header-top">
            <h1 className="header-title">{currentPage === 'home' ? getRoleTitle() : ''}</h1>
            <div className="header-user" onClick={() => { setActiveNav('profile'); setCurrentPage('profile'); }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="header-user-photo" />
              ) : (
                <div className="user-avatar">{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        {renderPage()}

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button
            className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveNav('home'); setCurrentPage('home'); }}
          >
            <Home size={24} className="nav-item-icon" />
            <span className="nav-item-label">Home</span>
          </button>
          <button
            className={`nav-item ${activeNav === 'calendar' ? 'active' : ''}`}
            onClick={() => { setActiveNav('calendar'); setCurrentPage('calendar'); }}
          >
            <Calendar size={24} className="nav-item-icon" />
            <span className="nav-item-label">Calendar</span>
          </button>
          <button
            className={`nav-item ${activeNav === 'messages' ? 'active' : ''}`}
            onClick={() => { setActiveNav('messages'); setCurrentPage('messages'); }}
          >
            <MessageSquare size={24} className="nav-item-icon" />
            <span className="nav-item-label">Messages</span>
          </button>
          <button
            className={`nav-item ${activeNav === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActiveNav('notifications'); setCurrentPage('announcements'); }}
          >
            <Bell size={24} className="nav-item-icon" />
            <span className="nav-item-label">Announcements</span>
          </button>
          <button
            className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveNav('profile'); setCurrentPage('profile'); }}
          >
            <User size={24} className="nav-item-icon" />
            <span className="nav-item-label">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
