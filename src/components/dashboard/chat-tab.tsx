
"use client"

import { useState, useEffect, useMemo, useRef } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquareCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatTab({ profile, initialChatId }: { profile: any, initialChatId?: string | null }) {
  const db = useFirestore();
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);
  const [chatUser, setChatUser] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemo(() => {
    if (!db || !activeChatId) return null;
    return query(
      collection(db, 'matches', activeChatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [db, activeChatId]);

  const { data: messages } = useCollection(messagesQuery);

  useEffect(() => {
    if (activeChatId && db) {
      const fetchChatUser = async () => {
        const matchDoc = await getDoc(doc(db, 'matches', activeChatId));
        if (matchDoc.exists()) {
          const otherId = matchDoc.data().participants.find((p: string) => p !== profile.uid);
          const userDoc = await getDoc(doc(db, 'users', otherId));
          setChatUser(userDoc.data());
        }
      };
      fetchChatUser();
    }
  }, [activeChatId, db, profile.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !activeChatId || !messageText.trim()) return;

    await addDoc(collection(db, 'matches', activeChatId, 'messages'), {
      senderId: profile.uid,
      text: messageText,
      timestamp: serverTimestamp()
    });

    setMessageText('');
  };

  if (!activeChatId) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center neo-card bg-white border-dashed">
        <MessageSquareCode className="h-16 w-16 mb-6 text-muted-foreground opacity-20" />
        <h2 className="text-3xl font-black italic uppercase text-muted-foreground tracking-tighter">Select a link to start chatting</h2>
        <p className="font-bold text-muted-foreground/60 mt-2">Communication is key to exchange.</p>
      </div>
    );
  }

  return (
    <div className="h-[80vh] flex flex-col neo-card bg-white overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="p-6 border-b-2 border-black flex items-center justify-between bg-accent/5">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">{chatUser?.name || 'Loading...'}</h2>
          <div className="text-[10px] font-bold uppercase text-muted-foreground">Language Reciprocity active</div>
        </div>
        <div className="text-xs font-black bg-white border-2 border-black px-2 py-1 uppercase italic shadow-neo-sm">
          {chatUser?.profileCode}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-6 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')] bg-repeat"
      >
        {messages?.map((msg) => {
          const isMine = msg.senderId === profile.uid;
          return (
            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] p-4 border-2 border-black font-medium shadow-neo-sm",
                isMine ? "bg-primary" : "bg-white"
              )}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-6 border-t-2 border-black bg-white flex gap-4">
        <Input 
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..." 
          className="neo-input h-14 text-lg flex-1"
        />
        <Button type="submit" className="neo-button h-14 w-14 p-0 bg-primary">
          <Send className="h-6 w-6" />
        </Button>
      </form>
    </div>
  );
}
