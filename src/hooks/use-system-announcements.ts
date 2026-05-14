import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export interface SystemAnnouncement {
  id: string;
  title: string;
  body: string;
  createdAt: any; // Firestore Timestamp
}

export function useSystemAnnouncements(userId?: string) {
  const db = useFirestore();
  const [activeAnnouncement, setActiveAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<any>(null);

  // Fetch user's lastSeenAnnouncement timestamp
  useEffect(() => {
    if (!db || !userId) return;

    const unsubscribe = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLastSeenTimestamp(data.lastSeenAnnouncement || null);
      }
    }, (error) => {
      console.error('System announcements user snapshot error:', error);
    });

    return () => unsubscribe();
  }, [db, userId]);

  // Fetch latest announcement and compare
  useEffect(() => {
    if (!db || lastSeenTimestamp === undefined) return; // Wait for initial user fetch

    const fetchLatestAnnouncement = async () => {
      const q = query(
        collection(db, 'system_announcements'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        const announcement = { id: latestDoc.id, ...latestDoc.data() } as SystemAnnouncement;
        
        // If user has no lastSeen timestamp, or the announcement is newer than their lastSeen
        if (!lastSeenTimestamp || (announcement.createdAt && lastSeenTimestamp.toMillis && announcement.createdAt.toMillis() > lastSeenTimestamp.toMillis())) {
          setActiveAnnouncement(announcement);
        } else {
          setActiveAnnouncement(null);
        }
      }
    };

    fetchLatestAnnouncement();
  }, [db, lastSeenTimestamp]);

  const dismissAnnouncement = async () => {
    if (!db || !userId) return;
    
    // Optimistic UI update
    setActiveAnnouncement(null);
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        lastSeenAnnouncement: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to update lastSeenAnnouncement:", error);
    }
  };

  return {
    activeAnnouncement,
    dismissAnnouncement
  };
}
