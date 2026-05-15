"use client"

import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle, UserPlus, XCircle, LayoutGrid, List, UserMinus } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import illMutual from '@/assets/ill mututal.jpg';
import { cn } from '@/lib/utils';

export function MatchesTab({ profile, onChatOpen }: { profile: any, onChatOpen: (id: string) => void }) {
  const db = useFirestore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pending' | 'manage' | 'friends'>('pending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const matchesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'matches'),
      where('participants', 'array-contains', profile.uid)
    );
  }, [db, profile.uid]);

  const { data: matches, loading } = useCollection(matchesQuery);
  const [matchDetails, setMatchDetails] = useState<any[]>([]);

  useEffect(() => {
    if (!matches || !db) return;

    const fetchDetails = async () => {
      const details = await Promise.all(matches.map(async (m) => {
        const otherId = m.participants.find((p: string) => p !== profile.uid);
        const userDoc = await getDoc(doc(db, 'users', otherId));
        return {
          ...m,
          otherUser: userDoc.data() || {},
          matchId: m.id
        };
      }));
      setMatchDetails(details);
    };

    fetchDetails();
  }, [matches, db, profile.uid]);

  const acceptMatch = async (matchId: string) => {
    if (!db) return;
    const match = matchDetails.find(m => m.matchId === matchId);
    updateDoc(doc(db, 'matches', matchId), { 
      status: 'accepted',
      newlyAcceptedFor: match?.initiator || null
    });
  };

  const removeMatch = async (matchId: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'matches', matchId));
  };

  const filteredMatches = useMemo(() => {
    return matchDetails.filter(m => {
      if (activeTab === 'pending') {
        return m.status === 'pending' && m.initiator !== profile.uid;
      }
      if (activeTab === 'friends') {
        return m.status === 'accepted';
      }
      if (activeTab === 'manage') {
        // Show outgoing pending requests and all accepted friends for managing
        return (m.status === 'pending' && m.initiator === profile.uid) || m.status === 'accepted';
      }
      return false;
    });
  }, [matchDetails, activeTab, profile.uid]);

  const getAvatar = (uid: string, photoURL?: string) => {
    if (photoURL) return photoURL;
    if (!uid) return '/avatars/1.jpg';
    let hash = 0;
    for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    const index = (Math.abs(hash) % 10) + 1;
    return `/avatars/${index}.jpg`;
  };

  const getDisplayName = (user: any) => user?.name || user?.email?.split('@')[0] || 'Anonymous User';

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase bg-white px-2 py-1 border-2 border-black tracking-widest">CONNECTION REQUESTS</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setActiveTab('pending')}
              className={cn("neo-button rounded-none border-2 border-black font-black uppercase h-12", activeTab === 'pending' ? "bg-primary text-black" : "bg-white text-black hover:bg-muted")}
            >
              PENDING REQUESTS
            </Button>
            <Button 
              onClick={() => setActiveTab('manage')}
              className={cn("neo-button rounded-none border-2 border-black font-black uppercase h-12", activeTab === 'manage' ? "bg-primary text-black" : "bg-white text-black hover:bg-muted")}
            >
              MANAGE CONNECTIONS
            </Button>
            <Button 
              onClick={() => setActiveTab('friends')}
              className={cn("neo-button rounded-none border-2 border-black font-black uppercase h-12", activeTab === 'friends' ? "bg-primary text-black" : "bg-white text-black hover:bg-muted")}
            >
              FRIENDS
            </Button>
          </div>

          <div className="flex gap-2 bg-white neo-card p-1 items-center h-12">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              onClick={() => setViewMode('list')} 
              className={cn("h-full aspect-square p-0 rounded-sm", viewMode === 'list' ? 'bg-black text-white hover:bg-black/80' : 'hover:bg-muted')}
            >
              <List className="h-5 w-5" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              onClick={() => setViewMode('grid')} 
              className={cn("h-full aspect-square p-0 rounded-sm", viewMode === 'grid' ? 'bg-black text-white hover:bg-black/80' : 'hover:bg-muted')}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
          {activeTab === 'pending' && "PENDING\nREQUESTS."}
          {activeTab === 'manage' && "MANAGE\nCONNECTIONS."}
          {activeTab === 'friends' && "YOUR\nFRIENDS."}
        </h2>
      </header>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="neo-card h-64 bg-white animate-pulse" />)}
        </div>
      ) : (
        <div className={cn("grid gap-6 md:gap-10", viewMode === 'grid' ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
          {filteredMatches.length > 0 ? (
            filteredMatches.map(m => (
              <div key={m.matchId} className={cn("bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", viewMode === 'list' ? "flex flex-col md:flex-row items-stretch p-0" : "flex flex-col p-4")}>
                {viewMode === 'list' ? (
                  <>
                    <div className="relative w-full md:w-48 h-48 md:h-auto border-b-4 md:border-b-0 md:border-r-4 border-black overflow-hidden bg-muted shrink-0">
                      <Image 
                        src={getAvatar(m.otherUser?.uid, m.otherUser?.photoURL)} 
                        alt={getDisplayName(m.otherUser)} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight">{getDisplayName(m.otherUser)}</h3>
                      <p className="text-sm font-bold text-muted-foreground mb-4">
                        {m.otherUser?.major} student looking to practice conversational {m.otherUser?.targetLanguage}.
                      </p>
                      <div className="flex gap-2 font-black text-[10px] uppercase tracking-widest mb-6">
                        <span className="bg-black text-white px-2 py-1">TEACHING: {m.otherUser?.nativeLanguage}</span>
                        <span className="bg-white text-black border-2 border-black px-2 py-1">LEARNING: {m.otherUser?.targetLanguage}</span>
                      </div>
                    </div>
                    <div className="border-t-4 md:border-t-0 md:border-l-4 border-black p-6 flex flex-col gap-2 justify-center bg-[#fafafa] shrink-0">
                      {activeTab === 'pending' && (
                        <>
                          <Button onClick={() => acceptMatch(m.matchId)} className="neo-button bg-primary w-full py-6 uppercase font-black tracking-widest text-black">
                            ACCEPT
                          </Button>
                          <Button onClick={() => removeMatch(m.matchId)} variant="outline" className="neo-button bg-white text-black border-2 border-black w-full py-6 uppercase font-black tracking-widest hover:bg-muted">
                            DECLINE
                          </Button>
                        </>
                      )}
                      {activeTab === 'friends' && (
                        <Button onClick={() => onChatOpen(m.matchId)} className="neo-button bg-accent w-full py-6 uppercase font-black tracking-widest text-black">
                          <MessageSquare className="mr-2 h-5 w-5" /> MESSAGE
                        </Button>
                      )}
                      {activeTab === 'manage' && (
                        <Button onClick={() => removeMatch(m.matchId)} variant="destructive" className="neo-button bg-red-500 w-full py-6 uppercase font-black tracking-widest text-white border-2 border-black">
                          <UserMinus className="mr-2 h-5 w-5" /> 
                          {m.status === 'pending' ? 'CANCEL REQUEST' : 'REMOVE CONNECTION'}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative h-64 w-full border-4 border-black overflow-hidden bg-muted mb-4">
                      <Image 
                        src={getAvatar(m.otherUser?.uid, m.otherUser?.photoURL)} 
                        alt={getDisplayName(m.otherUser)} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 text-left flex flex-col">
                      <h3 className="text-2xl font-black uppercase italic tracking-tight">{getDisplayName(m.otherUser)}</h3>
                      <p className="text-sm font-bold text-muted-foreground mb-4">
                        {m.otherUser?.major} student looking to practice conversational {m.otherUser?.targetLanguage}.
                      </p>
                      <div className="flex gap-2 font-black text-[8px] sm:text-[10px] uppercase tracking-widest mb-6 flex-wrap">
                        <span className="bg-black text-white px-2 py-1">TEACHING: {m.otherUser?.nativeLanguage}</span>
                        <span className="bg-white text-black border-2 border-black px-2 py-1">LEARNING: {m.otherUser?.targetLanguage}</span>
                      </div>
                      
                      <div className="mt-auto flex flex-col gap-2">
                        {activeTab === 'pending' && (
                          <>
                            <Button onClick={() => acceptMatch(m.matchId)} className="neo-button bg-primary w-full py-6 uppercase font-black tracking-widest text-black">
                              ACCEPT
                            </Button>
                            <Button onClick={() => removeMatch(m.matchId)} variant="outline" className="neo-button bg-white text-black border-2 border-black py-6 uppercase font-black tracking-widest hover:bg-muted w-full">
                              DECLINE
                            </Button>
                          </>
                        )}
                        {activeTab === 'friends' && (
                          <Button onClick={() => onChatOpen(m.matchId)} className="neo-button bg-accent w-full py-6 uppercase font-black tracking-widest text-black">
                            <MessageSquare className="mr-2 h-5 w-5" /> MESSAGE
                          </Button>
                        )}
                        {activeTab === 'manage' && (
                          <Button onClick={() => removeMatch(m.matchId)} variant="destructive" className="neo-button bg-red-500 w-full py-6 uppercase font-black tracking-widest text-white border-2 border-black">
                            <UserMinus className="mr-2 h-5 w-5" /> 
                            {m.status === 'pending' ? 'CANCEL REQUEST' : 'REMOVE CONNECTION'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center neo-card bg-white border-dashed flex flex-col items-center">
              <div className="relative h-48 w-48 mb-6 border-2 border-black overflow-hidden bg-muted shadow-neo-sm">
                <Image src={illMutual} alt="No matches" fill className="object-cover" />
              </div>
              <p className="text-2xl font-black italic uppercase text-muted-foreground">Nothing here yet!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
