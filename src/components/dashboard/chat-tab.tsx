"use client"

import { useState, useEffect, useMemo, useRef } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, getDoc, where, updateDoc, deleteDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquareCode, Video, Mic, ArrowLeft, MoreVertical, Search, User, Check, CheckCheck, Phone, Info, Smile, Paperclip, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import Image from 'next/image';
import illChat from '@/assets/ill chat.jpg';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useE2EEChat } from '@/hooks/use-e2e-chat';

export function ChatTab({ profile, initialChatId, privateKey }: { profile: any, initialChatId?: string | null, privateKey?: CryptoKey | null }) {
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);

  const { messages, sendEncryptedMessage, isEncrypted } = useE2EEChat(profile?.uid, activeChatId, privateKey || null);

  const [chatUser, setChatUser] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, matchId: string, otherUserId: string} | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Presence logic
  useEffect(() => {
    if (!db || !profile.uid) return;

    const userPresenceRef = doc(db, 'users', profile.uid);
    
    const setOnline = () => {
      setDoc(userPresenceRef, {
        status: 'online',
        lastSeen: serverTimestamp()
      }, { merge: true });
    };

    const setOffline = () => {
      setDoc(userPresenceRef, {
        status: 'offline',
        lastSeen: serverTimestamp()
      }, { merge: true });
    };

    setOnline();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') setOnline();
      else setOffline();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', setOffline);

    return () => {
      setOffline();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', setOffline);
    };
  }, [db, profile.uid]);

  // Listen to other user's presence and typing status
  useEffect(() => {
    if (!db || !activeChatId || !profile.uid) return;

    let unsubscribePresence: () => void;
    let unsubscribeTyping: () => void;

    const fetchOtherUserInfo = async () => {
      const matchDoc = await getDoc(doc(db, 'matches', activeChatId));
      if (matchDoc.exists()) {
        const otherId = matchDoc.data().participants.find((p: string) => p !== profile.uid);
        
        // Listen to presence
        unsubscribePresence = onSnapshot(doc(db, 'users', otherId), (doc) => {
          setChatUser(doc.data());
        }, (err) => console.error(err));

        // Listen to typing
        unsubscribeTyping = onSnapshot(doc(db, 'matches', activeChatId, 'typing', otherId), (doc) => {
          setOtherUserTyping(doc.data()?.isTyping || false);
        }, (err) => console.error(err));
      }
    };

    fetchOtherUserInfo();

    return () => {
      unsubscribePresence?.();
      unsubscribeTyping?.();
    };
  }, [db, activeChatId, profile.uid]);

  // Handle typing status
  useEffect(() => {
    if (!db || !activeChatId || !profile.uid) return;

    const typingRef = doc(db, 'matches', activeChatId, 'typing', profile.uid);
    
    if (messageText.length > 0 && !isTyping) {
      setIsTyping(true);
      setDoc(typingRef, { isTyping: true }, { merge: true });
    } else if (messageText.length === 0 && isTyping) {
      setIsTyping(false);
      setDoc(typingRef, { isTyping: false }, { merge: true });
    }

    const timeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setDoc(typingRef, { isTyping: false }, { merge: true });
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [messageText, db, activeChatId, profile.uid, isTyping]);

  // Fetch all accepted matches for sidebar
  const friendsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'matches'),
      where('participants', 'array-contains', profile.uid)
    );
  }, [db, profile.uid]);

  const { data: matches } = useCollection(friendsQuery);

  useEffect(() => {
    if (!matches || !db) return;
    const fetchDetails = async () => {
      const acceptedMatches = matches.filter(m => m.status === 'accepted');
      const details = await Promise.all(acceptedMatches.map(async (m) => {
        const otherId = m.participants.find((p: string) => p !== profile.uid);
        const userDoc = await getDoc(doc(db, 'users', otherId));
        return {
          ...m,
          otherUser: userDoc.data() || {},
          matchId: m.id
        };
      }));
      // Sort by lastMessageAt desc
      details.sort((a, b) => ((b as any).lastMessageAt?.toMillis() || 0) - ((a as any).lastMessageAt?.toMillis() || 0));
      setFriends(details);
    };
    fetchDetails();
  }, [matches, db, profile.uid]);

  // Mark messages as read when active
  useEffect(() => {
    if (!db || !activeChatId || !profile.uid || !messages) return;

    const unreadMessages = messages.filter(m => m.senderId !== profile.uid && m.status !== 'read');
    
    unreadMessages.forEach(async (m) => {
      await updateDoc(doc(db, 'matches', activeChatId, 'messages', m.id), {
        status: 'read'
      });
    });

  }, [messages, activeChatId, profile.uid, db]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, otherUserTyping]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !activeChatId || !messageText.trim()) return;

    const msg = messageText;
    setMessageText('');

    await sendEncryptedMessage(msg);

    if (chatUser) {
      await updateDoc(doc(db, 'matches', activeChatId), {
        unreadBy: chatUser.uid,
        lastMessageAt: serverTimestamp(),
        lastMessageText: isEncrypted ? '[Encrypted Message]' : msg.substring(0, 50)
      });
    }
  };
  const getAvatar = (uid: string, photoURL?: string) => {
    if (photoURL) return photoURL;
    if (!uid) return '/avatars/1.jpg';
    let hash = 0;
    for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    const index = (Math.abs(hash) % 10) + 1;
    return `/avatars/${index}.jpg`;
  };

  const handleContextMenu = (e: React.MouseEvent, matchId: string, otherUserId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, matchId, otherUserId });
  };

  const formatLastSeen = (timestamp: any) => {
    if (!timestamp) return 'Offline';
    const date = timestamp.toMillis ? new Date(timestamp.toMillis()) : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const comingSoon = () => {
    toast({
      title: "Coming Soon!",
      description: "This feature is currently under development.",
    });
  };

  const addEmoji = (emoji: any) => {
    setMessageText(prev => prev + emoji.native);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as any);
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    if (newWidth > 280 && newWidth < 550) {
      setSidebarWidth(newWidth);
    }
  };

  const stopResizing = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const filteredFriends = friends.filter(f => {
    const matchesSearch = f.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         f.otherUser?.profileCode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'unread') return f.unreadBy === profile.uid;
    if (filter === 'groups') return false; // Not implemented yet
    return true;
  });

  return (
    <div ref={containerRef} className="h-full w-full flex bg-white border-2 md:border-4 border-black overflow-hidden animate-in fade-in duration-300 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Context Menu Floating Layer */}
      {contextMenu && (
        <div 
          className="fixed z-[100] bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col p-1 w-56"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: Math.min(contextMenu.x, window.innerWidth - 224) }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
             className="px-4 py-3 text-left text-sm font-black uppercase hover:bg-primary/20 transition-colors border-b-2 border-black/10 flex items-center gap-2"
             onClick={() => { setActiveChatId(contextMenu.matchId); setContextMenu(null); }}
          >
            <MessageSquareCode className="h-4 w-4" /> Open Chat
          </button>
          <button 
             className="px-4 py-3 text-left text-sm font-black uppercase hover:bg-accent/20 transition-colors border-b-2 border-black/10 flex items-center gap-2"
             onClick={() => { navigator.clipboard.writeText(contextMenu.otherUserId); setContextMenu(null); }}
          >
            <User className="h-4 w-4" /> Copy User ID
          </button>
          <button 
             className="px-4 py-3 text-left text-sm font-black uppercase text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2 mt-1"
             onClick={async () => {
                if(window.confirm('Are you sure you want to completely remove this connection?')) {
                   if (!db) return;
                   await deleteDoc(doc(db, 'matches', contextMenu.matchId));
                   if(activeChatId === contextMenu.matchId) setActiveChatId(null);
                }
                setContextMenu(null);
             }}
          >
            Remove Match
          </button>
        </div>
      )}

      {/* Left Sidebar - Friend List */}
      <div 
        style={{ width: window.innerWidth > 768 ? sidebarWidth : '100%' }}
        className={cn(
          "border-r-4 border-black flex-col shrink-0 bg-[#fefefe] relative",
          activeChatId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Resize Handle */}
        <div 
          onMouseDown={startResizing}
          className="absolute right-[-6px] top-0 bottom-0 w-3 cursor-col-resize z-50 group hover:bg-primary/20 transition-colors hidden md:block"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-8 bg-black/20 group-hover:bg-black transition-colors" />
        </div>

        {/* Sidebar Header */}
        <div className="h-16 md:h-20 border-b-4 border-black bg-primary/20 flex items-center px-4 md:px-6 shrink-0 justify-between">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Chats</h2>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-white border-2 border-transparent hover:border-black transition-all">
                  <Filter className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-2 border-black shadow-neo rounded-none">
                <DropdownMenuItem onClick={() => setFilter('all')} className={cn("font-bold uppercase text-xs", filter === 'all' && "bg-primary/20")}>All Chats</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')} className={cn("font-bold uppercase text-xs", filter === 'unread' && "bg-primary/20")}>Unread</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('groups')} className={cn("font-bold uppercase text-xs", filter === 'groups' && "bg-primary/20")}>Groups (Soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={comingSoon} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-white border-2 border-transparent hover:border-black transition-all">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="p-3 border-b-4 border-black bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 z-10 pointer-events-none" />
            <Input 
              placeholder="Search or start new chat" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-black/40 bg-muted/20 h-11 w-full outline-none focus:ring-2 focus:ring-primary pr-3 py-2"
              style={{ paddingLeft: '3.5rem' }}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredFriends.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="font-bold uppercase text-xs italic">No chats found.</p>
            </div>
          ) : (
            filteredFriends.map(f => {
              const isActive = activeChatId === f.matchId;
              const hasUnread = f.unreadBy === profile.uid;
              return (
                <div 
                  key={f.matchId}
                  onClick={() => setActiveChatId(f.matchId)}
                  onContextMenu={(e) => handleContextMenu(e, f.matchId, f.otherUser?.uid)}
                  className={cn(
                    "flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b-2 border-black/10 cursor-pointer transition-colors relative group",
                    isActive ? "bg-accent/20" : "hover:bg-muted/30"
                  )}
                >
                  {/* Hover indicator block */}
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-black transition-transform", isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-50")} />
                  
                  <div className="relative h-12 w-12 md:h-14 md:w-14 border-2 border-black rounded-full overflow-hidden shrink-0 bg-white">
                    <Image src={getAvatar(f.otherUser?.uid, f.otherUser?.photoURL)} alt={f.otherUser?.name || 'Avatar'} fill className="object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-black text-sm md:text-base uppercase truncate pr-2">{f.otherUser?.name || 'Anonymous User'}</span>
                      {f.lastMessageAt && (
                        <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase shrink-0">
                          {new Date(f.lastMessageAt.toMillis()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className={cn("text-xs truncate", hasUnread ? "font-black" : "font-medium text-muted-foreground")}>
                        {f.lastMessageText || <span className="italic text-[10px] uppercase">Language: {f.otherUser?.nativeLanguage}</span>}
                      </span>
                      {hasUnread && (
                        <div className="h-4 w-4 rounded-full bg-accent border border-black shrink-0 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-black rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex-col bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')] bg-repeat relative",
        !activeChatId ? "hidden md:flex" : "flex"
      )}>
        {!activeChatId ? (
          <div className="h-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-4 text-center">
            <div className="relative h-48 w-48 mb-6 border-4 border-black overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Image src={illChat} alt="Select chat" fill className="object-cover" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">NO one to chat with ??</h2>
            <p className="font-bold text-muted-foreground max-w-md mx-auto text-sm md:text-base border-2 border-black p-4 bg-primary/10">
              Select a friend from the left sidebar to start messaging. Mutual matches ensure high-quality language exchange.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 md:h-20 p-2 md:p-4 border-b-4 border-black flex items-center justify-between bg-white shrink-0 z-10 shadow-sm">
              <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveChatId(null)}
                  className="md:hidden h-10 w-10 p-0 mr-1 rounded-full border-2 border-transparent active:border-black"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div className="relative h-10 w-10 md:h-12 md:w-12 border-2 border-black rounded-full overflow-hidden shrink-0 bg-muted">
                  <Image src={getAvatar(chatUser?.uid, chatUser?.photoURL)} alt={chatUser?.name || 'Avatar'} fill className="object-cover" />
                </div>
                
                <div className="flex flex-col min-w-0">
                  <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tight truncate">
                    {chatUser?.name || 'Loading...'}
                  </h2>
                  <div className={cn(
                    "text-[10px] font-bold uppercase flex items-center gap-1",
                    chatUser?.status === 'online' ? "text-green-600" : "text-muted-foreground"
                  )}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", chatUser?.status === 'online' ? "bg-green-500" : "bg-gray-400")} /> 
                    {chatUser?.status === 'online' ? 'Online' : `Last seen: ${formatLastSeen(chatUser?.lastSeen)}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <div className="flex items-center gap-1 bg-muted/20 p-1 border-2 border-black">
                   <Button onClick={comingSoon} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-none border-2 border-transparent hover:border-black">
                     <Phone className="h-4 w-4" />
                   </Button>
                   <Button onClick={comingSoon} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-none border-2 border-transparent hover:border-black">
                     <Video className="h-4 w-4" />
                   </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-muted hidden sm:flex">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 border-2 border-black shadow-neo rounded-none">
                    <DropdownMenuItem className="font-bold uppercase text-xs focus:bg-primary/20" onClick={comingSoon}>
                       <Info className="h-4 w-4 mr-2" /> Contact Info
                    </DropdownMenuItem>
                    <DropdownMenuItem className="font-bold uppercase text-xs focus:bg-primary/20" onClick={comingSoon}>
                       <Search className="h-4 w-4 mr-2" /> Search in chat
                    </DropdownMenuItem>
                    <DropdownMenuItem className="font-bold uppercase text-xs text-red-600 focus:bg-red-50" onClick={() => setActiveChatId(null)}>Close Chat</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 flex flex-col bg-white/60"
            >
              {/* Encrypted Disclaimer */}
              <div className="mx-auto bg-accent/20 border-2 border-black px-4 py-2 text-[10px] md:text-xs font-bold uppercase text-center max-w-sm mb-4">
                Messages and calls are end-to-end encrypted. No one outside of this chat, not even TrierTongue, can read or listen to them.
              </div>

              {messages?.map((msg, i) => {
                const isMine = msg.senderId === profile.uid;
                const prevMsg = i > 0 ? messages[i-1] : null;
                const showTail = !prevMsg || prevMsg.senderId !== msg.senderId;

                return (
                  <div key={msg.id} className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] md:max-w-[70%] p-3 md:p-4 border-2 border-black font-medium text-sm md:text-base relative group shadow-sm",
                      isMine ? "bg-[#dcf8c6] ml-auto" : "bg-white mr-auto",
                      showTail && isMine && "rounded-tr-none",
                      showTail && !isMine && "rounded-tl-none"
                    )}>
                      {/* Message Tail CSS tricks */}
                      {showTail && (
                        <div className={cn(
                          "absolute top-[-2px] w-4 h-4 border-t-2 border-black z-[-1]",
                          isMine ? "right-[-10px] border-r-2 bg-[#dcf8c6]" : "left-[-10px] border-l-2 bg-white",
                        )} style={{ clipPath: isMine ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%)' }} />
                      )}

                      <div className="flex flex-col">
                        <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                        <div className="flex items-center justify-end gap-1 mt-1">
                           <span className="text-[9px] md:text-[10px] font-bold text-black/50 uppercase select-none">
                             {msg.timestamp ? new Date(msg.timestamp.toMillis()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                           </span>
                           {isMine && (
                             <div className="flex items-center">
                                {msg.status === 'read' ? (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                ) : (msg.status === 'delivered' || (msg.status === 'sent' && chatUser && (chatUser.status === 'online' || (chatUser.lastSeen && msg.timestamp && chatUser.lastSeen.toMillis() > msg.timestamp.toMillis())))) ? (
                                  <CheckCheck className="h-3 w-3 text-gray-500" />
                                ) : (
                                  <Check className="h-3 w-3 text-gray-400" />
                                )}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {otherUserTyping && (
                <div className="flex justify-start">
                   <div className="bg-white p-3 border-2 border-black rounded-full shadow-sm flex items-center gap-1">
                      <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" />
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t-4 border-black bg-[#f0f2f5] shrink-0 relative">
              {showEmojiPicker && (
                <div className="absolute bottom-full left-4 mb-2 z-50 animate-in slide-in-from-bottom-2">
                  <Picker 
                    data={data} 
                    onEmojiSelect={(emoji: any) => {
                      addEmoji(emoji);
                      setShowEmojiPicker(false);
                    }} 
                    theme="light"
                  />
                </div>
              )}
              <form onSubmit={sendMessage} className="flex gap-2 md:gap-4 items-end max-w-5xl mx-auto">
                <Button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  type="button" 
                  variant="ghost" 
                  className={cn(
                    "h-10 w-10 md:h-12 md:w-12 p-0 rounded-full shrink-0 transition-all",
                    showEmojiPicker ? "bg-black text-white" : "hover:bg-black/5"
                  )}
                >
                  <Smile className="h-6 w-6" />
                </Button>

                <Button 
                  onClick={comingSoon} 
                  type="button" 
                  variant="ghost" 
                  className="h-10 w-10 md:h-12 md:w-12 p-0 rounded-full shrink-0 transition-all hover:bg-black/5"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="neo-input min-h-[48px] md:min-h-[56px] max-h-[150px] text-base md:text-lg flex-1 rounded-2xl px-6 bg-white shadow-sm py-3 resize-none"
                  rows={1}
                />

                <div className="flex gap-1 md:gap-2 shrink-0 mb-1 items-center">
                  <Button
                    type="submit"
                    disabled={!messageText.trim()}
                    variant="ghost"
                    className={cn(
                      "h-12 w-12 p-0 transition-all hover:bg-primary/20 rounded-full",
                      messageText.trim() ? "text-primary scale-110" : "text-muted-foreground scale-90 opacity-50"
                    )}
                  >
                    <Send className="h-6 w-6 ml-1" />
                  </Button>
                  <Button onClick={comingSoon} variant="ghost" className="h-12 w-12 p-0 rounded-full hover:bg-black/5 transition-transform hover:scale-105">
                    <Mic className="h-6 w-6" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
