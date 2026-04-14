import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import app from '../config/firebase';

const TOKENS_COLLECTION = 'fcm_tokens';
const NOTIFICATIONS_COLLECTION = 'notifications';

let messaging: ReturnType<typeof getMessaging> | null = null;

const getMessagingInstance = () => {
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch {
      console.warn('FCM not supported in this browser');
    }
  }
  return messaging;
};

// Request notification permission and save FCM token
export const requestNotificationPermission = async (userId: string): Promise<boolean> => {
  try {
    if (!('Notification' in window)) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const msg = getMessagingInstance();
    if (!msg) return false;

    const token = await getToken(msg, {
      vapidKey: '', // Will work without VAPID key for basic setup
    });

    if (token) {
      await setDoc(doc(db, TOKENS_COLLECTION, userId), {
        token,
        userId,
        updatedAt: Timestamp.now(),
      });
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Notification setup failed:', error);
    return false;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: { title: string; body: string }) => void) => {
  const msg = getMessagingInstance();
  if (!msg) return () => {};

  return onMessage(msg, (payload) => {
    callback({
      title: payload.notification?.title || 'Mayuri Kids Villa',
      body: payload.notification?.body || 'You have a new notification',
    });
  });
};

// In-app notification types
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'message' | 'announcement' | 'fee' | 'attendance' | 'report' | 'incident';
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

// Create in-app notification (stored in Firestore)
export const createNotification = async (
  userId: string,
  title: string,
  body: string,
  type: AppNotification['type'],
  data?: Record<string, string>
): Promise<void> => {
  try {
    const { addDoc } = await import('firebase/firestore');
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      userId,
      title,
      body,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      data: data || {},
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Send notification to multiple users
export const notifyUsers = async (
  userIds: string[],
  title: string,
  body: string,
  type: AppNotification['type']
): Promise<void> => {
  for (const userId of userIds) {
    await createNotification(userId, title, body, type);
  }

  // Also show browser notification if supported
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/images/logo.png',
    });
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId: string, limit = 50): Promise<AppNotification[]> => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as AppNotification))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId: string): Promise<void> => {
  try {
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), { read: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
  }
};

// Get unread count
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false),
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (error) {
    return 0;
  }
};
