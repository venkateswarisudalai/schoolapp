import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Message, Conversation } from '../types/index';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

// Get all conversations for a user
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

// Subscribe to conversations in real-time
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
    callback(conversations);
  }, (error) => {
    console.error('Error subscribing to conversations:', error);
  });

  return unsubscribe;
};

// Get or create a conversation between two users
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string,
  childId?: string
): Promise<string> => {
  try {
    // Check if conversation already exists
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', 'array-contains', userId1)
    );
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.participants.includes(userId2)) {
        // If childId is specified, check if it matches
        if (!childId || data.childId === childId) {
          return doc.id;
        }
      }
    }

    // Create new conversation
    const newConversation = {
      participants: [userId1, userId2],
      childId: childId || null,
      unreadCount: { [userId1]: 0, [userId2]: 0 },
      lastMessage: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), newConversation);
    return docRef.id;
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
};

// Get or create a CLASS GROUP conversation
export const getOrCreateClassGroup = async (
  classId: string,
  className: string,
  memberIds: string[]
): Promise<string> => {
  try {
    // Check if class group already exists - search by classId
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('classId', '==', classId)
    );
    const snap = await getDocs(q);
    // Filter for class groups client-side (avoids needing composite index)
    const classGroups = snap.docs.filter(d => d.data().isClassGroup === true);

    if (classGroups.length > 0) {
      // Update participants if new members joined
      const existing = classGroups[0];
      const data = existing.data();
      const existingIds = new Set(data.participants || []);
      const newIds = memberIds.filter(id => !existingIds.has(id));
      if (newIds.length > 0) {
        const allIds = [...data.participants, ...newIds];
        await updateDoc(doc(db, CONVERSATIONS_COLLECTION, existing.id), { participants: allIds });
      }
      return existing.id;
    }

    // Create new class group
    const unreadCount: Record<string, number> = {};
    memberIds.forEach(id => { unreadCount[id] = 0; });

    const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
      participants: memberIds,
      isClassGroup: true,
      classId,
      className,
      lastMessage: null,
      unreadCount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating class group:', error);
    throw error;
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
    } as Message));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Subscribe to messages in real-time
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
    orderBy('timestamp', 'asc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
    } as Message));
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
  });

  return unsubscribe;
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: 'parent' | 'teacher' | 'admin' | 'student',
  content: string
): Promise<string> => {
  try {
    // Add message to subcollection
    const messageData = {
      conversationId,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: serverTimestamp(),
      isRead: false
    };

    const messageRef = await addDoc(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
      messageData
    );

    // Update conversation with last message
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const unreadCount = conversationData.unreadCount || {};

      // Increment unread count for other participants
      conversationData.participants.forEach((participantId: string) => {
        if (participantId !== senderId) {
          unreadCount[participantId] = (unreadCount[participantId] || 0) + 1;
        }
      });

      await updateDoc(conversationRef, {
        lastMessage: {
          content,
          senderId,
          senderName,
          timestamp: new Date().toISOString()
        },
        unreadCount,
        updatedAt: serverTimestamp()
      });
    }

    // Send in-app notification to other participants
    try {
      const { createNotification } = await import('./notificationService');
      const conversationData = conversationDoc.data();
      if (conversationData) {
        for (const pid of conversationData.participants) {
          if (pid !== senderId) {
            await createNotification(pid, `Message from ${senderName}`, content.substring(0, 100), 'message');
          }
        }
      }
    } catch { /* notification is best-effort */ }

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages as read
export const markConversationAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      const data = conversationDoc.data();
      const unreadCount = data.unreadCount || {};
      unreadCount[userId] = 0;

      await updateDoc(conversationRef, { unreadCount });
    }

    // Mark individual messages as read
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
      where('isRead', '==', false),
      where('senderId', '!=', userId)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(msgDoc =>
      updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, msgDoc.id), {
        isRead: true
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

// Get total unread count for a user
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  try {
    const conversations = await getConversations(userId);
    let total = 0;

    conversations.forEach(conv => {
      const unreadCount = (conv as any).unreadCount;
      if (unreadCount && unreadCount[userId]) {
        total += unreadCount[userId];
      }
    });

    return total;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    return 0;
  }
};

// Delete a conversation
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    // Note: In production, you might want to also delete all messages in the subcollection
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, { deleted: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
