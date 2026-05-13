
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Languages, Calendar, GraduationCap, ChevronRight, MessageSquareCode } from 'lucide-react';
import { aiMatchCompatibilitySummary, type AiMatchCompatibilitySummaryOutput } from '@/ai/flows/ai-match-compatibility-summary';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface MatchCardProps {
  currentUser: any;
  student: any;
}

export function MatchCard({ currentUser, student }: MatchCardProps) {
  const [isMatchPending, setIsMatchPending] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const handleMatchRequest = async () => {
    if (!db) return;
    try {
      addDoc(collection(db, 'matches'), {
        participants: [currentUser.uid, student.uid],
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsMatchPending(true);
      toast({
        title: "Friend Request Sent!",
        description: `Waiting for ${student.name} to accept.`
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message
      });
    }
  };

  return (
    <div className="mx-auto w-full bg-[#fefefe] rounded-[1rem] p-2 text-[#141417] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
      <article className="w-full">
        <section className="bg-primary/20 rounded-[0.5rem_0.5rem_0_0] p-6 text-sm border-2 border-black border-b-0">
          <header className="flex justify-between items-center font-bold">
            <span className="uppercase text-[10px] tracking-widest bg-white border-2 border-black px-2 py-1 shadow-neo-sm">
              #{student.profileCode || 'NEW-USER'}
            </span>
            <div className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white rounded-full shadow-neo-sm">
              <svg height={16} width={16} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </header>
          <p className="mt-8 mb-4 text-3xl md:text-4xl font-black uppercase italic leading-none">{student.name}</p>
        </section>
        
        <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 font-bold text-sm border-2 border-black bg-white rounded-[0_0_0.5rem_0.5rem]">
          <div className="flex justify-start items-center gap-3">
            <div className="w-12 h-12 border-2 border-black bg-muted/10 flex items-center justify-center shrink-0 shadow-neo-sm rounded">
              <svg height={28} width={28} viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
                <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
                <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" />
                <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
              </svg>
            </div>
            <div>
              <p className="uppercase text-sm font-black italic leading-tight">{student.major}</p>
              <p className="uppercase text-[10px] text-muted-foreground mt-1">
                {student.nativeLanguage} <span className="text-black">→</span> {student.targetLanguage}
              </p>
            </div>
          </div>
          <button 
            onClick={handleMatchRequest}
            disabled={isMatchPending}
            className="w-full sm:w-max font-black border-2 border-black px-6 py-3 bg-[#141417] text-white text-xs uppercase hover:bg-white hover:text-black hover:shadow-neo transition-all disabled:opacity-50 rounded-full"
          >
            {isMatchPending ? 'REQUEST SENT' : 'BEFRIEND'}
          </button>
        </footer>
      </article>
    </div>
  );
}
