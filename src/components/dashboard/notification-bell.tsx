"use client"

import { useState, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { useNotifications } from '@/hooks/use-notifications';
import { markNotificationAsRead } from '@/firebase/notifications';
import { cn } from '@/lib/utils';

export function NotificationBell({ profile, onNavigate }: { profile: any, onNavigate: (tab: string) => void }) {
  const db = useFirestore();
  const [open, setOpen] = useState(false);

  // New centralized notification system
  const { notifications, unreadCount: centralizedUnreadCount } = useNotifications(profile.uid);

  // Legacy matches-based notifications
  const matchesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'matches'), where('participants', 'array-contains', profile.uid));
  }, [db, profile.uid]);

  const { data: matches } = useCollection(matchesQuery);

  const pendingRequests = matches?.filter(m => m.status === 'pending' && m.initiator !== profile.uid) || [];
  const unreadMessages = matches?.filter(m => m.unreadBy === profile.uid) || [];
  const newlyAccepted = matches?.filter(m => m.status === 'accepted' && m.newlyAcceptedFor === profile.uid) || [];

  const legacyCount = pendingRequests.length + unreadMessages.length + newlyAccepted.length;
  const totalCount = legacyCount + centralizedUnreadCount;

  const handleNotificationClick = async (type: string, matchId?: string) => {
    setOpen(false);
    if (type === 'pending') {
      onNavigate('matches');
    } else if (type === 'message') {
      onNavigate('chat');
    } else if (type === 'accepted' && matchId) {
      if (db) {
        await updateDoc(doc(db, 'matches', matchId), { newlyAcceptedFor: null });
      }
      onNavigate('matches');
    }
  };

  const handleCentralizedNotificationClick = async (notif: any) => {
    setOpen(false);
    if (!notif.isRead && db) {
      await markNotificationAsRead(db, notif.id);
    }
    
    // Navigate based on type
    if (notif.type === 'NEW_MESSAGE' || notif.type === 'CALL_INVITE') {
      onNavigate('chat');
    } else if (notif.type === 'FRIEND_REQUEST' || notif.type === 'FRIEND_ACCEPT' || notif.type === 'NEW_MATCH') {
      onNavigate('matches');
    } else if (notif.link) {
      // If we had a router, we would router.push(notif.link)
      window.location.href = notif.link;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-muted border-2 border-transparent hover:border-black transition-all">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-black transform translate-x-1/4 -translate-y-1/4">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white border-2 border-black shadow-neo rounded-none p-0 z-50">
        <div className="bg-black text-white p-2 font-black uppercase text-xs tracking-widest text-center">
          Notifications
        </div>
        <div className="max-h-[350px] overflow-y-auto">
          {totalCount === 0 ? (
            <div className="p-4 text-center text-sm font-bold text-muted-foreground uppercase italic">
              No new notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Legacy Notifications */}
              {pendingRequests.length > 0 && (
                <button 
                  onClick={() => handleNotificationClick('pending')}
                  className="p-3 border-b-2 border-black text-left hover:bg-primary/20 transition-colors flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span className="text-xs font-bold uppercase">{pendingRequests.length} new friend request(s)</span>
                </button>
              )}
              {unreadMessages.length > 0 && (
                <button 
                  onClick={() => handleNotificationClick('message')}
                  className="p-3 border-b-2 border-black text-left hover:bg-accent/20 transition-colors flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  <span className="text-xs font-bold uppercase">{unreadMessages.length} unread message(s)</span>
                </button>
              )}
              {newlyAccepted.map(match => (
                <button 
                  key={match.id}
                  onClick={() => handleNotificationClick('accepted', match.id)}
                  className="p-3 border-b-2 border-black text-left hover:bg-primary/20 transition-colors flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-xs font-bold uppercase">Someone accepted your request!</span>
                </button>
              ))}

              {/* Centralized Notifications */}
              {notifications.map(notif => (
                <button 
                  key={notif.id}
                  onClick={() => handleCentralizedNotificationClick(notif)}
                  className={cn(
                    "p-3 border-b-2 border-black text-left transition-colors flex flex-col gap-1",
                    notif.isRead ? "opacity-60 bg-muted/20" : "bg-white hover:bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    <span className="text-xs font-black uppercase">{notif.title}</span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{notif.body}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
