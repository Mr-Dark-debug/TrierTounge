import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AppNotification } from '@/firebase/notifications';
import { useToast } from './use-toast';

export function useNotifications(userId?: string) {
  const db = useFirestore();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!db || !userId) return;

    // Only use a simple equality filter — no orderBy — to avoid needing
    // a composite index.  We sort client-side after receiving results.
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      let unread = 0;

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !snapshot.metadata.fromCache) {
          const data = change.doc.data() as AppNotification;
          if (!data.isRead) {
            if (data.type === 'CALL_INVITE') {
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

      // Sort client-side: newest first, then cap at 50
      notifs.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setNotifications(notifs.slice(0, 50));
      setUnreadCount(unread);
    }, (error) => {
      console.warn('Notifications listener error:', error.message);
      setNotifications([]);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, [db, userId, toast]);

  return {
    notifications,
    unreadCount,
    hasUnread: unreadCount > 0
  };
}
