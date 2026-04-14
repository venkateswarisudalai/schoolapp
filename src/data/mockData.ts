import type { User, Child, Class, Attendance, DailyActivity, Announcement, Message, Conversation, LessonPlan, FeeStructure, FeePayment, SchoolEvent, Teacher } from '../types/index';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'parent-1',
    email: 'parent@mayuri.com',
    name: 'Priya Sharma',
    role: 'parent',
    phone: '+91 98765 43210',
  },
  {
    id: 'teacher-1',
    email: 'teacher@mayuri.com',
    name: 'Anjali Desai',
    role: 'teacher',
    phone: '+91 98765 43211',
  },
  {
    id: 'teacher-2',
    email: 'teacher2@mayuri.com',
    name: 'Rekha Patel',
    role: 'teacher',
    phone: '+91 98765 43212',
  },
  {
    id: 'admin-1',
    email: 'admin@mayuri.com',
    name: 'Sunita Verma',
    role: 'admin',
    phone: '+91 98765 43213',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    email: 'teacher@mayuri.com',
    name: 'Anjali Desai',
    role: 'teacher',
    phone: '+91 98765 43211',
    assignedClasses: ['class-1'],
    qualification: 'B.Ed, Early Childhood Education',
    joinDate: '2022-06-01',
    salary: 35000,
  },
  {
    id: 'teacher-2',
    email: 'teacher2@mayuri.com',
    name: 'Rekha Patel',
    role: 'teacher',
    phone: '+91 98765 43212',
    assignedClasses: ['class-2'],
    qualification: 'M.A. Child Psychology',
    joinDate: '2023-01-15',
    salary: 38000,
  },
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Sunshine Nursery',
    ageGroup: '2-3 years',
    teacherId: 'teacher-1',
    capacity: 15,
    currentStrength: 12,
    schedule: {
      startTime: '09:00',
      endTime: '12:30',
      workingDays: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'class-2',
    name: 'Rainbow LKG',
    ageGroup: '3-4 years',
    teacherId: 'teacher-2',
    capacity: 20,
    currentStrength: 18,
    schedule: {
      startTime: '08:30',
      endTime: '13:00',
      workingDays: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'class-3',
    name: 'Star UKG',
    ageGroup: '4-5 years',
    teacherId: 'teacher-1',
    capacity: 25,
    currentStrength: 22,
    schedule: {
      startTime: '08:30',
      endTime: '13:30',
      workingDays: [1, 2, 3, 4, 5],
    },
  },
];

// Mock Children
export const mockChildren: Child[] = [
  {
    id: 'child-1',
    name: 'Aarav Sharma',
    dateOfBirth: '2021-03-15',
    gender: 'male',
    classId: 'class-1',
    parentIds: ['parent-1'],
    enrollmentDate: '2024-04-01',
    bloodGroup: 'B+',
    allergies: [{ allergen: 'Peanuts', severity: 'moderate', actionPlan: 'Avoid peanuts. Give antihistamine if consumed.' }],
    emergencyContacts: [
      { name: 'Priya Sharma', relationship: 'Mother', phone: '+91 98765 43210', isPrimary: true },
      { name: 'Rahul Sharma', relationship: 'Father', phone: '+91 98765 43214', isPrimary: false },
    ],
    documents: [],
  },
  {
    id: 'child-2',
    name: 'Ananya Singh',
    dateOfBirth: '2020-08-22',
    gender: 'female',
    classId: 'class-2',
    parentIds: ['parent-2'],
    enrollmentDate: '2023-06-15',
    bloodGroup: 'O+',
    emergencyContacts: [
      { name: 'Neha Singh', relationship: 'Mother', phone: '+91 98765 43215', isPrimary: true },
    ],
    documents: [],
  },
];

// Mock Attendance
const today = new Date().toISOString().split('T')[0];
export const mockAttendance: Attendance[] = [
  {
    id: 'att-1',
    childId: 'child-1',
    date: today,
    status: 'present',
    checkInTime: '09:05',
    markedBy: 'teacher-1',
  },
  {
    id: 'att-2',
    childId: 'child-2',
    date: today,
    status: 'present',
    checkInTime: '08:45',
    markedBy: 'teacher-2',
  },
];

// Mock Daily Activities
export const mockDailyActivities: DailyActivity[] = [
  {
    id: 'activity-1',
    childId: 'child-1',
    date: today,
    teacherId: 'teacher-1',
    meals: [
      { type: 'breakfast', time: '09:30', items: 'Idli with sambar', consumption: 'all' },
      { type: 'snack', time: '11:00', items: 'Apple slices and biscuits', consumption: 'most' },
    ],
    napTime: [
      { startTime: '11:30', endTime: '12:15', quality: 'good' },
    ],
    bathroomLogs: [
      { time: '10:00', type: 'potty', notes: 'Good progress!' },
    ],
    activities: [
      {
        time: '09:45',
        activity: 'Circle Time',
        description: 'Sang rhymes and learned about colors',
        participation: 'active',
        skills: ['Language', 'Social'],
      },
      {
        time: '10:30',
        activity: 'Art & Craft',
        description: 'Finger painting with primary colors',
        participation: 'active',
        skills: ['Fine Motor', 'Creativity'],
      },
    ],
    mood: 'happy',
    healthNotes: 'Had a great day!',
    photos: [],
  },
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Annual Day Celebration',
    content: 'Dear Parents, We are excited to announce our Annual Day celebration on January 26th. Please ensure your child attends the rehearsals this week. Theme: Colors of India.',
    createdBy: 'admin-1',
    createdAt: '2024-01-10T10:00:00Z',
    targetAudience: 'all',
    priority: 'important',
  },
  {
    id: 'ann-2',
    title: 'Holiday Notice - Pongal',
    content: 'The school will remain closed on January 14th and 15th for Pongal celebrations. Wishing all families a happy Pongal!',
    createdBy: 'admin-1',
    createdAt: '2024-01-08T09:00:00Z',
    targetAudience: 'all',
    priority: 'normal',
  },
  {
    id: 'ann-3',
    title: 'Fee Reminder',
    content: 'This is a gentle reminder that the quarterly fee for Q4 is due by January 15th. Please make the payment to avoid late fees.',
    createdBy: 'admin-1',
    createdAt: '2024-01-05T11:00:00Z',
    targetAudience: 'parents',
    priority: 'urgent',
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'parent-1',
    senderName: 'Priya Sharma',
    senderRole: 'parent',
    content: 'Hi Teacher, I wanted to inform you that Aarav had a slight cold yesterday. He is better now but please keep an eye on him.',
    timestamp: '2024-01-10T08:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'teacher-1',
    senderName: 'Anjali Desai',
    senderRole: 'teacher',
    content: 'Thank you for letting me know, Mrs. Sharma. I will make sure Aarav stays hydrated and comfortable. He seems cheerful today!',
    timestamp: '2024-01-10T09:15:00Z',
    isRead: true,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['parent-1', 'teacher-1'],
    lastMessage: mockMessages[1],
    unreadCount: 0,
    childId: 'child-1',
  },
];

// Mock Lesson Plans
export const mockLessonPlans: LessonPlan[] = [
  {
    id: 'plan-1',
    teacherId: 'teacher-1',
    classId: 'class-1',
    date: today,
    theme: 'Colors and Shapes',
    objectives: [
      'Identify primary colors',
      'Recognize basic shapes',
      'Improve fine motor skills through art',
    ],
    activities: [
      {
        time: '09:00',
        duration: 15,
        name: 'Welcome Circle',
        description: 'Greetings, attendance, and weather chart',
        type: 'circle-time',
        skills: ['Social', 'Language'],
      },
      {
        time: '09:15',
        duration: 20,
        name: 'Color Hunt',
        description: 'Find objects of specific colors in classroom',
        type: 'learning',
        skills: ['Cognitive', 'Physical'],
      },
      {
        time: '09:35',
        duration: 25,
        name: 'Shape Art',
        description: 'Create pictures using shape cutouts',
        type: 'art',
        skills: ['Fine Motor', 'Creativity'],
      },
      {
        time: '10:00',
        duration: 15,
        name: 'Snack Time',
        description: 'Healthy snack break',
        type: 'free-play',
        skills: ['Self-care'],
      },
      {
        time: '10:15',
        duration: 20,
        name: 'Outdoor Play',
        description: 'Free play in the garden',
        type: 'outdoor',
        skills: ['Gross Motor', 'Social'],
      },
      {
        time: '10:35',
        duration: 15,
        name: 'Story Time',
        description: 'Read "The Color Monster" book',
        type: 'story',
        skills: ['Language', 'Emotional'],
      },
      {
        time: '10:50',
        duration: 20,
        name: 'Music & Movement',
        description: 'Color songs and dancing',
        type: 'music',
        skills: ['Gross Motor', 'Rhythm'],
      },
      {
        time: '11:10',
        duration: 50,
        name: 'Nap Time',
        description: 'Rest period',
        type: 'free-play',
        skills: ['Self-regulation'],
      },
      {
        time: '12:00',
        duration: 30,
        name: 'Goodbye Circle',
        description: 'Review day, songs, and dismissal',
        type: 'circle-time',
        skills: ['Social', 'Memory'],
      },
    ],
    materials: ['Color cards', 'Shape cutouts', 'Glue', 'Paper', 'Crayons', 'The Color Monster book'],
    notes: 'Focus on children who need extra support with shape recognition',
  },
];

// Mock Fee Structures
export const mockFeeStructures: FeeStructure[] = [
  {
    id: 'fee-1',
    name: 'Monthly Tuition Fee',
    amount: 5000,
    frequency: 'monthly',
    description: 'Regular tuition fee',
    applicableClasses: ['class-1', 'class-2', 'class-3'],
  },
  {
    id: 'fee-2',
    name: 'Annual Admission Fee',
    amount: 15000,
    frequency: 'one-time',
    description: 'One-time admission fee',
    applicableClasses: ['class-1', 'class-2', 'class-3'],
  },
  {
    id: 'fee-3',
    name: 'Activity Fee',
    amount: 2000,
    frequency: 'quarterly',
    description: 'Art, music, and sports activities',
    applicableClasses: ['class-1', 'class-2', 'class-3'],
  },
];

// Mock Fee Payments
export const mockFeePayments: FeePayment[] = [
  {
    id: 'payment-1',
    childId: 'child-1',
    feeStructureId: 'fee-1',
    amount: 5000,
    dueDate: '2024-01-10',
    paidDate: '2024-01-08',
    status: 'paid',
    paymentMethod: 'upi',
    receiptNumber: 'RCP-2024-001',
  },
  {
    id: 'payment-2',
    childId: 'child-1',
    feeStructureId: 'fee-1',
    amount: 5000,
    dueDate: '2024-02-10',
    status: 'pending',
  },
  {
    id: 'payment-3',
    childId: 'child-2',
    feeStructureId: 'fee-1',
    amount: 5000,
    dueDate: '2024-01-10',
    status: 'overdue',
  },
];

// Mock Events
export const mockEvents: SchoolEvent[] = [
  {
    id: 'event-1',
    title: 'Annual Day Celebration',
    description: 'Annual function with cultural performances by children',
    date: '2024-01-26',
    startTime: '10:00',
    endTime: '13:00',
    type: 'celebration',
    targetClasses: 'all',
    createdBy: 'admin-1',
  },
  {
    id: 'event-2',
    title: 'Parent-Teacher Meeting',
    description: 'Quarterly progress discussion',
    date: '2024-02-15',
    startTime: '09:00',
    endTime: '12:00',
    type: 'ptm',
    targetClasses: 'all',
    createdBy: 'admin-1',
  },
  {
    id: 'event-3',
    title: 'Republic Day Holiday',
    description: 'School closed for Republic Day',
    date: '2024-01-26',
    startTime: '00:00',
    endTime: '23:59',
    type: 'holiday',
    targetClasses: 'all',
    createdBy: 'admin-1',
  },
];
