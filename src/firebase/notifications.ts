import { collection, addDoc, serverTimestamp, doc, updateDoc, writeBatch } from 'firebase/firestore';

export type NotificationType = 'FRIEND_REQUEST' | 'FRIEND_ACCEPT' | 'NEW_MATCH' | 'NEW_MESSAGE' | 'CALL_INVITE' | 'SYSTEM_ANNOUNCEMENT';

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
}

/**
 * Reusable utility to send targeted notifications.
 * It saves the notification to the DB, which automatically publishes it over the user-specific snapshot listener.
 */
export async function sendNotification(
  firestoreDb: any, 
  recipientId: string, 
  type: NotificationType, 
  title: string, 
  body: string, 
  link?: string, 
  senderId?: string
) {
  try {
    await addDoc(collection(firestoreDb, 'notifications'), {
      recipientId,
      senderId: senderId || null,
      type,
      title,
      body,
      link: link || null,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(firestoreDb: any, notificationId: string) {
  try {
    await updateDoc(doc(firestoreDb, 'notifications', notificationId), {
      isRead: true
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

/**
 * Marks all unread notifications for a user as read.
 */
export async function markAllAsRead(firestoreDb: any, unreadNotifications: AppNotification[]) {
  if (!unreadNotifications.length) return;
  try {
    const batch = writeBatch(firestoreDb);
    unreadNotifications.forEach(n => {
      batch.update(doc(firestoreDb, 'notifications', n.id), { isRead: true });
    });
    await batch.commit();
  } catch (error) {
    console.error("Failed to mark all as read:", error);
  }
}
