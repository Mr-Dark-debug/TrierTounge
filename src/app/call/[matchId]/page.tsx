
"use client"

import { useState, useEffect, useMemo } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { PhoneOff, Mic, Video, Sparkles, MessageSquare, ArrowLeft, User } from 'lucide-react';
import { generateConversationStarters } from '@/ai/flows/conversation-starters';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function PracticeCallPage() {
  const { matchId } = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [match, setMatch] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [starters, setStarters] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);

  const { data: profile } = useDoc(
    user && db ? doc(db, 'users', user.uid) : null
  );

  useEffect(() => {
    if (matchId && db && user) {
      const fetchCallData = async () => {
        const matchDoc = await getDoc(doc(db, 'matches', matchId as string));
        if (matchDoc.exists()) {
          const mData = matchDoc.data();
          setMatch(mData);
          const otherId = mData.participants.find((p: string) => p !== user.uid);
          const otherDoc = await getDoc(doc(db, 'users', otherId));
          setOtherUser(otherDoc.data());
        }
      };
      fetchCallData();
    }
  }, [matchId, db, user]);

  const handleGenStarters = async () => {
    if (!profile || !otherUser) return;
    setIsGenerating(true);
    try {
      const result = await generateConversationStarters({
        targetLanguage: profile.targetLanguage,
        studentAGoals: profile.academicGoals,
        studentBGoals: otherUser.academicGoals
      });
      setStarters(result.starters);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!otherUser || !profile) {
    return <div className="min-h-screen flex items-center justify-center font-black italic uppercase">Connecting to Practice Room...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" className="neo-button bg-white text-black p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">{t('practiceRoom')}</h2>
            <p className="text-[10px] font-bold text-primary uppercase italic">{profile.nativeLanguage} ↔ {otherUser.nativeLanguage}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-white/10 px-4 py-2 border-2 border-white/20">
          <div className="w-3 h-3 bg-red-500 animate-pulse rounded-full" />
          <span className="font-black text-xs uppercase tracking-widest italic">LIVE PRACTICE</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Video Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="relative flex-1 neo-card bg-neutral-900 border-white overflow-hidden min-h-[400px]">
            <Image 
              src={`https://picsum.photos/seed/${otherUser.uid}/800/600`} 
              alt={otherUser.name} 
              fill 
              className="object-cover opacity-50 grayscale"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="h-32 w-32 mx-auto border-4 border-primary bg-black/50 flex items-center justify-center">
                  <User className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter">{otherUser.name}</h3>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">In {otherUser.campus}</p>
              </div>
            </div>
            
            {/* Self View */}
            <div className="absolute bottom-6 right-6 w-32 h-44 md:w-48 md:h-64 neo-card bg-black border-white overflow-hidden hidden sm:block">
               <Image 
                src={`https://picsum.photos/seed/${user?.uid}/400/400`} 
                alt="Me" 
                fill 
                className="object-cover grayscale"
              />
              <div className="absolute bottom-2 left-2 bg-primary px-2 py-0.5 border-2 border-black text-[8px] font-black text-black">YOU</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 md:gap-8 pb-4">
            <Button 
              onClick={() => setMicActive(!micActive)}
              className={cn("neo-button h-16 w-16 md:h-20 md:w-20 p-0", micActive ? "bg-white text-black" : "bg-red-500 text-white")}
            >
              <Mic className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            <Button 
              onClick={() => setVideoActive(!videoActive)}
              className={cn("neo-button h-16 w-16 md:h-20 md:w-20 p-0", videoActive ? "bg-white text-black" : "bg-red-500 text-white")}
            >
              <Video className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            <Button 
              onClick={() => router.back()}
              className="neo-button bg-red-600 hover:bg-red-700 h-16 w-32 md:h-20 md:w-48 p-0"
            >
              <PhoneOff className="h-6 w-6 md:h-8 md:w-8 mr-2" />
              <span className="font-black hidden md:inline uppercase">{t('endCall')}</span>
            </Button>
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="neo-card bg-white text-black flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b-2 border-black bg-primary flex items-center justify-between">
              <h4 className="font-black uppercase italic text-sm tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> {t('startersTitle')}
              </h4>
              <div className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase">v1.0 AI</div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {starters.length > 0 ? (
                starters.map((s, i) => (
                  <div key={i} className="p-3 border-2 border-black bg-neutral-50 font-bold text-sm italic leading-tight animate-in slide-in-from-right-4 duration-300">
                    "{s}"
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p className="text-[10px] font-black uppercase">Need help talking?</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-100 border-t-2 border-black">
              <Button 
                onClick={handleGenStarters} 
                disabled={isGenerating}
                className="w-full neo-button bg-accent text-black text-xs py-6 h-auto whitespace-normal"
              >
                {isGenerating ? 'AI BRAINSTORMING...' : t('genStarters')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
