import { doc, getDoc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AppSettings {
  qrCheckInEnabled: boolean;
  updatedAt?: string;
}

const SETTINGS_DOC = 'qr';
const SETTINGS_COLLECTION = 'app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  qrCheckInEnabled: true,
};

export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const snap = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC));
    if (!snap.exists()) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(snap.data() as AppSettings) };
  } catch (error) {
    console.error('Error loading app settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const updateAppSettings = async (patch: Partial<AppSettings>): Promise<void> => {
  await setDoc(
    doc(db, SETTINGS_COLLECTION, SETTINGS_DOC),
    { ...patch, updatedAt: new Date().toISOString(), updatedAtTs: Timestamp.now() },
    { merge: true }
  );
};

export const subscribeAppSettings = (
  cb: (settings: AppSettings) => void
): (() => void) => {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC), snap => {
    if (snap.exists()) {
      cb({ ...DEFAULT_SETTINGS, ...(snap.data() as AppSettings) });
    } else {
      cb(DEFAULT_SETTINGS);
    }
  });
};
