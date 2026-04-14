// User Types
export type UserRole = 'parent' | 'teacher' | 'admin' | 'student';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  approvalStatus?: ApprovalStatus; // New users need admin approval
  requestedAt?: string; // When the user signed up
}

export interface Parent extends User {
  role: 'parent';
  children: string[]; // Child IDs
}

export interface Teacher extends User {
  role: 'teacher';
  assignedClasses: string[]; // Class IDs
  qualification: string;
  joinDate: string;
  salary: number;
}

export interface Admin extends User {
  role: 'admin';
}

// Child/Student Types
export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  classId: string;
  parentIds: string[];
  enrollmentDate: string;
  bloodGroup?: string;
  allergies?: AllergyInfo[];
  medications?: MedicationInfo[];
  medicalConditions?: string[];
  doctorName?: string;
  doctorPhone?: string;
  emergencyContacts: EmergencyContact[];
  authorizedPickups?: AuthorizedPickup[];
  photo?: string;
  documents: Document[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  canPickup?: boolean;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  ageGroup: string;
  teacherId: string;
  assistantTeacherId?: string;
  capacity: number;
  currentStrength: number;
  schedule: ClassSchedule;
}

export interface ClassSchedule {
  startTime: string;
  endTime: string;
  workingDays: number[]; // 0-6, Sunday-Saturday
}

// Attendance Types
export interface Attendance {
  id: string;
  childId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  checkInTime?: string;
  checkOutTime?: string;
  markedBy: string;
  notes?: string;
}

// Daily Activity Types
export interface DailyActivity {
  id: string;
  childId: string;
  date: string;
  teacherId: string;
  meals: MealLog[];
  napTime: NapLog[];
  bathroomLogs: BathroomLog[];
  activities: ActivityLog[];
  mood: 'happy' | 'sad' | 'tired' | 'energetic' | 'sick';
  healthNotes?: string;
  photos: string[];
}

export interface MealLog {
  type: 'breakfast' | 'lunch' | 'snack';
  time: string;
  items: string;
  consumption: 'all' | 'most' | 'some' | 'none';
}

export interface NapLog {
  startTime: string;
  endTime: string;
  quality: 'good' | 'restless' | 'refused';
}

export interface BathroomLog {
  time: string;
  type: 'diaper' | 'potty' | 'accident';
  notes?: string;
}

export interface ActivityLog {
  time: string;
  activity: string;
  description: string;
  participation: 'active' | 'moderate' | 'minimal';
  skills: string[];
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  targetAudience: 'all' | 'parents' | 'teachers' | 'class';
  targetClassId?: string;
  priority: 'normal' | 'important' | 'urgent';
  attachments?: string[];
  isRead?: boolean;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  childId?: string; // For parent-teacher conversations about a specific child
}

// Activity Planner Types (Teacher)
export interface LessonPlan {
  id: string;
  teacherId: string;
  classId: string;
  date: string;
  theme: string;
  objectives: string[];
  activities: PlannedActivity[];
  materials: string[];
  notes?: string;
}

export interface PlannedActivity {
  time: string;
  duration: number; // in minutes
  name: string;
  description: string;
  type: 'circle-time' | 'art' | 'music' | 'outdoor' | 'sensory' | 'story' | 'free-play' | 'learning';
  skills: string[];
}

// Fee Management Types
export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  description: string;
  applicableClasses: string[];
}

export interface FeePayment {
  id: string;
  childId: string;
  feeStructureId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'bank-transfer';
  transactionId?: string;
  receiptNumber?: string;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: 'birth-certificate' | 'aadhar' | 'photo' | 'medical' | 'previous-school' | 'other';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Event Types
export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'holiday' | 'event' | 'ptm' | 'activity' | 'celebration';
  targetClasses: string[] | 'all';
  createdBy: string;
}

// Progress Report Types
export interface ProgressReport {
  id: string;
  childId: string;
  period: string; // e.g., "Jan 2024 - Mar 2024"
  teacherId: string;
  createdAt: string;
  physicalDevelopment: DevelopmentArea;
  cognitiveSkills: DevelopmentArea;
  socialEmotional: DevelopmentArea;
  languageSkills: DevelopmentArea;
  creativeExpression: DevelopmentArea;
  overallComments: string;
  areasOfImprovement: string[];
  achievements: string[];
}

export interface DevelopmentArea {
  skills: SkillAssessment[];
  comments: string;
}

export interface SkillAssessment {
  skill: string;
  level: 'emerging' | 'developing' | 'proficient' | 'advanced';
}

// Assignment Types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  dueDate: string;
  createdAt: string;
  type: 'homework' | 'classwork' | 'project' | 'worksheet';
  subject: string;
  attachments?: string[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  childId: string;
  childName: string;
  submittedAt?: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  remarks?: string;
}

// Feed Post Types (Brightwheel-style activity feed)
export interface FeedPost {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  caption: string;
  photoUrls: string[];
  taggedChildIds: string[];
  category: 'learning' | 'play' | 'meal' | 'art' | 'milestone' | 'general';
  createdAt: string;
}

// QR Check-in Types
export interface QRToken {
  id: string;
  classId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
}

// Incident/Accident Report
export interface IncidentReport {
  id: string;
  childId: string;
  childName: string;
  date: string;
  time: string;
  location: string;
  description: string;
  actionTaken: string;
  severity: 'minor' | 'moderate' | 'serious';
  witnesses: string[];
  reportedBy: string;
  reportedByName: string;
  parentAcknowledged: boolean;
  parentAcknowledgedAt?: string;
  createdAt: string;
}

// Authorized Pickup Person
export interface AuthorizedPickup {
  name: string;
  relationship: string;
  phone: string;
  pin: string;
  canPickup: boolean;
}

// Allergy Info
export interface AllergyInfo {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  actionPlan: string;
}

// Medication Info
export interface MedicationInfo {
  name: string;
  dosage: string;
  schedule: string;
  prescribedBy: string;
}

export interface CheckInRecord {
  id: string;
  childId: string;
  parentId: string;
  classId: string;
  type: 'check-in' | 'check-out';
  timestamp: string;
  method: 'qr' | 'manual';
  qrTokenId?: string;
}
