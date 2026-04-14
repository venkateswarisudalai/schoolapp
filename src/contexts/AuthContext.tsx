import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import type { User, UserRole } from '../types/index';
import { mockUsers } from '../data/mockData';
import {
  createOrUpdateUser,
  getUserById,
  updateUserApprovalStatus,
  subscribeToPendingUsers,
  subscribeToUser,
} from '../services/userService';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  pendingUsers: User[];
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  demoLogin: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Subscribe to pending users for admin (real-time)
  useEffect(() => {
    if (user?.role === 'admin' && user?.approvalStatus === 'approved') {
      const unsubscribe = subscribeToPendingUsers((users) => {
        setPendingUsers(users);
      });
      return unsubscribe;
    }
  }, [user?.role, user?.approvalStatus]);

  // Subscribe to current user's data changes (real-time)
  useEffect(() => {
    if (firebaseUser && !isDemoMode) {
      const unsubscribe = subscribeToUser(firebaseUser.uid, (userData) => {
        if (userData) {
          setUser(userData);
        }
      });
      return unsubscribe;
    }
  }, [firebaseUser, isDemoMode]);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser && !isDemoMode) {
        try {
          // Check if user exists in Firestore
          const existingUser = await getUserById(fbUser.uid);

          if (existingUser) {
            setUser(existingUser);
          } else {
            // No Firestore doc found — auto-create from auth data
            // Derive a sensible name from email (e.g. anjali.desai@... → Anjali Desai)
            const emailName = (fbUser.email || '').split('@')[0]
              .replace(/[._]/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase());

            const newUser: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || emailName || '',
              role: 'parent',
              phone: fbUser.phoneNumber || '',
              avatar: fbUser.photoURL || undefined,
              approvalStatus: 'pending',
              requestedAt: new Date().toISOString(),
            };

            // Check mock users for pre-approved staff
            const mockUser = mockUsers.find(u => u.email === fbUser.email);
            if (mockUser) {
              newUser.name = mockUser.name;
              newUser.role = mockUser.role;
              newUser.phone = mockUser.phone;
              newUser.approvalStatus = 'approved';
            }

            await createOrUpdateUser({
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              phone: newUser.phone,
              avatar: newUser.avatar,
              approvalStatus: newUser.approvalStatus || 'pending',
            });

            setUser(newUser);
          }
        } catch (err) {
          console.error('Error fetching/creating user:', err);
          setError('Failed to load user data');
        }
      } else if (!isDemoMode) {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      setIsDemoMode(false);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      setIsDemoMode(false);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setError(null);
      setLoading(true);
      setIsDemoMode(false);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user in Firestore with pending status
      await createOrUpdateUser({
        id: result.user.uid,
        email: email,
        name: name,
        role: role,
        phone: '',
        approvalStatus: 'pending',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setIsDemoMode(false);
      await signOut(auth);
      setUser(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      throw err;
    }
  };

  const setUserRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const approveUser = async (userId: string) => {
    try {
      await updateUserApprovalStatus(userId, 'approved');
      // Real-time listener will update pendingUsers automatically
    } catch (err) {
      console.error('Error approving user:', err);
      throw err;
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      await updateUserApprovalStatus(userId, 'rejected');
      // Real-time listener will update pendingUsers automatically
    } catch (err) {
      console.error('Error rejecting user:', err);
      throw err;
    }
  };

  // Demo login for testing without Firebase
  const demoLogin = (role: UserRole) => {
    setIsDemoMode(true);
    const demoUser = mockUsers.find(u => u.role === role);
    if (demoUser) {
      setUser({
        ...demoUser,
        approvalStatus: 'approved',
      });
    }
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
      throw err;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    error,
    pendingUsers,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    setUserRole,
    approveUser,
    rejectUser,
    demoLogin,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
