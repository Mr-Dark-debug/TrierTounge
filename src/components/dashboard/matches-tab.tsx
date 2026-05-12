
"use client"

import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle, UserPlus, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';

export function MatchesTab({ profile, onChatOpen }: { profile: any, onChatOpen: (id: string) => void }) {
  const db = useFirestore();
  const { t } = useLanguage();
  
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
          otherUser: userDoc.data(),
          matchId: m.id
        };
      }));
      setMatchDetails(details);
    };

    fetchDetails();
  }, [matches, db, profile.uid]);

  const acceptMatch = async (matchId: string) => {
    if (!db) return;
    updateDoc(doc(db, 'matches', matchId), { status: 'accepted' });
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase bg-primary px-2 py-0.5 border-2 border-black tracking-widest italic">{t('activeLinks')}</span>
        </div>
        <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
          {t('mutualConnections')}
        </h2>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="neo-card h-32 bg-white animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {matchDetails.length > 0 ? (
            matchDetails.map(m => (
              <div key={m.matchId} className="neo-card bg-white p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative h-20 w-20 shrink-0 border-2 border-black overflow-hidden bg-muted">
                  <Image 
                    src={`https://picsum.photos/seed/${m.otherUser?.uid}/200/200`} 
                    alt={m.otherUser?.name || 'User'} 
                    fill 
                    className="object-cover grayscale"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">{m.otherUser?.name}</h3>
                  <div className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-center md:justify-start gap-2 italic tracking-tighter">
                    {m.otherUser?.major} • {m.otherUser?.nativeLanguage} → {m.otherUser?.targetLanguage}
                  </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  {m.status === 'pending' ? (
                    <div className="flex gap-2 w-full">
                      <Button onClick={() => acceptMatch(m.matchId)} className="neo-button bg-primary flex-1 py-6 h-14 uppercase tracking-tighter">
                        <CheckCircle className="mr-2 h-4 w-4" /> {t('accept')}
                      </Button>
                      <Button variant="outline" className="neo-button bg-white text-destructive border-destructive px-4 h-14">
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => onChatOpen(m.matchId)} className="neo-button bg-accent w-full md:w-auto py-6 h-14 uppercase tracking-tighter">
                      <MessageSquare className="mr-2 h-4 w-4" /> {t('openChat')}
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center neo-card bg-white border-dashed">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-xl font-black italic uppercase text-muted-foreground">{t('noMatches')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
