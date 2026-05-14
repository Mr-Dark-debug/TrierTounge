import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { AppNotification } from '@/firebase/notifications';
import { useToast } from './use-toast';

export function useNotifications(userId?: string) {
  const db = useFirestore();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!db || !userId) return;

    // We query notifications where recipient is the current user.
    // We order by createdAt descending to show newest first.
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to recent 50 to avoid massive reads
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      let unread = 0;

      snapshot.docChanges().forEach((change) => {
        // If a new high-priority notification comes in (e.g. Call or Message)
        // and the component isn't mounting for the first time, show a toast.
        if (change.type === 'added' && snapshot.metadata.hasPendingWrites) {
           const data = change.doc.data() as AppNotification;
           if (!data.isRead) {
              if (data.type === 'CALL_INVITE') {
                 // Trigger full screen interactive call modal in a real app
                 toast({
                   title: `📞 Incoming Call`,
                   description: data.body,
                   duration: 10000,
                 });
              } else {
                 toast({
                   title: data.title,
                   description: data.body,
                 });
              }
           }
        }
      });

      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<AppNotification, 'id'>;
        notifs.push({ id: doc.id, ...data });
        if (!data.isRead) unread++;
      });

      setNotifications(notifs);
      setUnreadCount(unread);
    }, (error) => {
      console.error('Notifications snapshot error (check rules):', error);
    });

    return () => unsubscribe();
  }, [db, userId, toast]);

  return {
    notifications,
    unreadCount,
    hasUnread: unreadCount > 0
  };
}
