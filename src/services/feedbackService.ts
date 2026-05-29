import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { AppFeedback, FeedbackCategory } from '../types/index';

const COLLECTION = 'app_feedback';
const APP_VERSION = 'v1.0';

// Where feedback emails are delivered.
const OWNER_EMAIL = 'venkateswari1095@gmail.com';

export interface FeedbackInput {
  category: FeedbackCategory;
  message: string;
  rating?: number;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export interface FeedbackResult {
  saved: boolean;   // written to Firestore
  emailed: boolean; // delivered via EmailJS
}

/**
 * Submit app feedback. Best-effort dual delivery:
 *   1. Saved to the `app_feedback` Firestore collection (backup / in-app review).
 *   2. Emailed to the app owner via EmailJS — only if the three VITE_EMAILJS_*
 *      env vars are configured. Until then feedback still saves to Firestore.
 * Throws only if BOTH channels fail, so the form can show a real error.
 */
export const submitFeedback = async (input: FeedbackInput): Promise<FeedbackResult> => {
  let saved = false;
  let emailed = false;

  // 1. Firestore (audit trail + in-app review)
  try {
    await addDoc(collection(db, COLLECTION), {
      category: input.category,
      message: input.message,
      ...(input.rating ? { rating: input.rating } : {}),
      userId: input.userId || '',
      userName: input.userName || 'Anonymous',
      userEmail: input.userEmail || '',
      userRole: input.userRole || '',
      appVersion: APP_VERSION,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      status: 'new',
      createdAt: new Date().toISOString(),
      createdAtTs: Timestamp.now(),
    });
    saved = true;
  } catch (error) {
    console.error('Feedback: failed to save to Firestore', error);
  }

  // 2. EmailJS (delivered to OWNER_EMAIL) — only when configured
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      const emailjs = (await import('@emailjs/browser')).default;
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: OWNER_EMAIL,
          category: input.category,
          rating: input.rating ? `${input.rating}/5` : 'Not rated',
          message: input.message,
          from_name: input.userName || 'Anonymous',
          from_email: input.userEmail || 'unknown',
          user_role: input.userRole || 'unknown',
          app_version: APP_VERSION,
        },
        { publicKey }
      );
      emailed = true;
    } catch (error) {
      console.error('Feedback: failed to send email via EmailJS', error);
    }
  } else {
    console.info('Feedback: EmailJS not configured (VITE_EMAILJS_* env vars missing) — saved to Firestore only.');
  }

  if (!saved && !emailed) {
    throw new Error('Could not submit feedback. Please check your connection and try again.');
  }

  return { saved, emailed };
};

/** Admin: read all feedback, newest first. */
export const getAllFeedback = async (): Promise<AppFeedback[]> => {
  const q = query(collection(db, COLLECTION), orderBy('createdAtTs', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppFeedback));
};

/** Admin: mark a feedback item as reviewed. */
export const markFeedbackReviewed = async (feedbackId: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, feedbackId), { status: 'reviewed' });
};
