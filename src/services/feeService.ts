import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { FeePayment, FeeCategory } from '../types/index';

const COLLECTION_NAME = 'fee_payments';
const FEE_CONFIG_COLLECTION = 'fee_config';

// Fee config types
export interface FeeConfig {
  id: string;
  classId: string;
  className: string;
  monthlyFee: number;
  upiId: string;
  schoolName: string;
  updatedAt?: string;
}

// Save/update fee config for a class
export const saveFeeConfig = async (config: Omit<FeeConfig, 'id'>): Promise<void> => {
  try {
    await setDoc(doc(db, FEE_CONFIG_COLLECTION, config.classId), {
      ...config,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving fee config:', error);
    throw error;
  }
};

// Get fee config for a class
export const getFeeConfig = async (classId: string): Promise<FeeConfig | null> => {
  try {
    const docSnap = await getDoc(doc(db, FEE_CONFIG_COLLECTION, classId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FeeConfig;
    }
    return null;
  } catch (error) {
    console.error('Error getting fee config:', error);
    return null;
  }
};

// Get all fee configs
export const getAllFeeConfigs = async (): Promise<FeeConfig[]> => {
  try {
    const snap = await getDocs(collection(db, FEE_CONFIG_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FeeConfig));
  } catch (error) {
    console.error('Error getting fee configs:', error);
    return [];
  }
};

// Generate monthly fee records for all students in a class
export const generateMonthlyFees = async (
  classId: string,
  month: number,
  year: number,
  amount: number,
  children: { id: string; name: string }[]
): Promise<number> => {
  let created = 0;
  const dueDate = `${year}-${String(month + 1).padStart(2, '0')}-10`;

  for (const child of children) {
    // Check if a monthly fee already exists for this child+month+year
    // (use month/year fields when present, fall back to dueDate match for legacy records)
    const byMonth = await getDocs(query(
      collection(db, COLLECTION_NAME),
      where('childId', '==', child.id),
      where('category', '==', 'monthly'),
      where('month', '==', month),
      where('year', '==', year)
    ));
    const byDueDate = byMonth.empty
      ? await getDocs(query(
          collection(db, COLLECTION_NAME),
          where('childId', '==', child.id),
          where('dueDate', '==', dueDate)
        ))
      : null;

    const existsAlready = !byMonth.empty || (byDueDate && !byDueDate.empty);

    if (!existsAlready) {
      await addDoc(collection(db, COLLECTION_NAME), {
        childId: child.id,
        feeStructureId: classId,
        amount,
        dueDate,
        status: 'pending',
        category: 'monthly',
        month,
        year,
        createdAt: Timestamp.now(),
      });
      created++;
    }
  }
  return created;
};

// Add an ad-hoc charge for a single child (admission, annual day, books, etc.)
export const addAdHocFee = async (params: {
  childId: string;
  category: Exclude<FeeCategory, 'monthly'>;
  label: string;
  amount: number;
  dueDate: string;
  classId?: string;
}): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    childId: params.childId,
    feeStructureId: params.classId || '',
    amount: params.amount,
    dueDate: params.dueDate,
    status: 'pending',
    category: params.category,
    label: params.label,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

// Add an ad-hoc charge for every child in a class
export const addAdHocFeeForClass = async (params: {
  classId: string;
  category: Exclude<FeeCategory, 'monthly'>;
  label: string;
  amount: number;
  dueDate: string;
  children: { id: string }[];
}): Promise<number> => {
  for (const c of params.children) {
    await addAdHocFee({
      childId: c.id,
      category: params.category,
      label: params.label,
      amount: params.amount,
      dueDate: params.dueDate,
      classId: params.classId,
    });
  }
  return params.children.length;
};

// Record a single payment that covers multiple months (term/quarterly fee).
// Finds-or-creates a monthly record for each (month, year) and marks them all paid
// with the same receipt number, so analytics shows each month as paid and an audit
// trail links the records back to one receipt.
export const recordTermPayment = async (params: {
  childId: string;
  classId: string;
  monthlyAmount: number;
  months: { month: number; year: number }[];
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank-transfer';
  transactionId?: string;
  paidDate?: string;
}): Promise<{ receiptNumber: string; recordsMarkedPaid: number }> => {
  const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;
  const paidDate = params.paidDate || new Date().toISOString().split('T')[0];
  let marked = 0;

  for (const { month, year } of params.months) {
    const dueDate = `${year}-${String(month + 1).padStart(2, '0')}-10`;

    // Look up the existing monthly record. Check by month/year first, then fall back to dueDate.
    let existingId: string | null = null;
    const byMonth = await getDocs(query(
      collection(db, COLLECTION_NAME),
      where('childId', '==', params.childId),
      where('category', '==', 'monthly'),
      where('month', '==', month),
      where('year', '==', year)
    ));
    if (!byMonth.empty) {
      existingId = byMonth.docs[0].id;
    } else {
      const byDueDate = await getDocs(query(
        collection(db, COLLECTION_NAME),
        where('childId', '==', params.childId),
        where('dueDate', '==', dueDate)
      ));
      if (!byDueDate.empty) existingId = byDueDate.docs[0].id;
    }

    if (existingId) {
      await updateDoc(doc(db, COLLECTION_NAME, existingId), {
        status: 'paid',
        paidDate,
        paymentMethod: params.paymentMethod,
        transactionId: params.transactionId || '',
        receiptNumber,
        month,
        year,
        category: 'monthly',
        updatedAt: Timestamp.now(),
      });
    } else {
      // Create-and-mark-paid if the monthly record didn't exist yet
      await addDoc(collection(db, COLLECTION_NAME), {
        childId: params.childId,
        feeStructureId: params.classId,
        amount: params.monthlyAmount,
        dueDate,
        status: 'paid',
        category: 'monthly',
        month,
        year,
        paidDate,
        paymentMethod: params.paymentMethod,
        transactionId: params.transactionId || '',
        receiptNumber,
        createdAt: Timestamp.now(),
      });
    }
    marked++;
  }

  return { receiptNumber, recordsMarkedPaid: marked };
};

// Get all fee payments (for admin)
export const getAllFeePayments = async (): Promise<FeePayment[]> => {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FeePayment));
  } catch (error) {
    console.error('Error getting all payments:', error);
    return [];
  }
};

export const saveFeePayment = async (paymentData: Omit<FeePayment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...paymentData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving fee payment:', error);
    throw error;
  }
};

export const getFeePaymentsByChild = async (childId: string): Promise<FeePayment[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('childId', '==', childId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FeePayment));
  } catch (error) {
    console.error('Error getting fee payments:', error);
    throw error;
  }
};

export const updateFeePaymentStatus = async (
  paymentId: string,
  status: 'paid' | 'pending' | 'overdue' | 'partial',
  paymentDetails?: {
    paidDate?: string;
    paymentMethod?: 'cash' | 'card' | 'upi' | 'bank-transfer';
    transactionId?: string;
    receiptNumber?: string;
  }
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId);
    await updateDoc(docRef, {
      status,
      ...paymentDetails,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating fee payment:', error);
    throw error;
  }
};

export const getAllPendingPayments = async (): Promise<FeePayment[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', ['pending', 'overdue'])
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FeePayment));
  } catch (error) {
    console.error('Error getting pending payments:', error);
    throw error;
  }
};

// Generate GPay payment link
export const generateGPayLink = (
  upiId: string,
  amount: number,
  name: string,
  note: string
): string => {
  // UPI deep link format for GPay
  const params = new URLSearchParams({
    pa: upiId,  // Payee VPA (UPI ID)
    pn: name,   // Payee name
    am: amount.toString(),  // Amount
    cu: 'INR',  // Currency
    tn: note,   // Transaction note
  });

  return `upi://pay?${params.toString()}`;
};

// Example usage:
// const gpayLink = generateGPayLink('mayuri@oksbi', 5000, 'Mayuri Playschool', 'Monthly Fee - January 2024');
