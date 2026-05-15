
"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Languages, Calendar, GraduationCap, ChevronRight, MessageSquareCode, User, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MatchCardProps {
  currentUser: any;
  student: any;
  viewMode?: 'grid' | 'list';
}

export function MatchCard({ currentUser, student, viewMode = 'grid' }: MatchCardProps) {
  const [isMatchPending, setIsMatchPending] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const handleMatchRequest = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!db) return;
    try {
      await addDoc(collection(db, 'matches'), {
        participants: [currentUser.uid, student.uid],
        initiator: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsMatchPending(true);
      toast({
        title: "Friend Request Sent!",
        description: `Waiting for ${displayName} to accept.`
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message
      });
    }
  };

  const avatarSrc = useMemo(() => {
    if (student.photoURL) return student.photoURL;
    let hash = 0;
    const uid = student.uid || 'fallback';
    for (let i = 0; i < uid.length; i++) {
      hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % 10) + 1;
    return `/avatars/${index}.jpg`;
  }, [student]);

  const displayName = useMemo(() => {
    return student.name || student.email?.split('@')[0] || 'Anonymous User';
  }, [student.email, student.name]);

  if (viewMode === 'list') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="w-full bg-white rounded-[1rem] p-4 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform cursor-pointer gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 md:w-16 md:h-16 border-2 border-black rounded-full overflow-hidden shrink-0 bg-muted">
                 <Image src={avatarSrc} alt={displayName} fill className="object-cover" />
              </div>
              <div className="text-left">
                <p className="font-black uppercase text-lg md:text-xl italic leading-tight">{displayName}</p>
                <p className="text-xs font-bold uppercase text-muted-foreground">{student.major}</p>
              </div>
            </div>
            
            <div className="hidden md:block text-left text-xs font-bold uppercase">
              <span className="text-muted-foreground">Speaks:</span> {student.nativeLanguage} <br/>
              <span className="text-muted-foreground">Learning:</span> {student.targetLanguage}
            </div>

            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleMatchRequest();
              }}
              disabled={isMatchPending}
              className="neo-button bg-[#141417] text-white hover:bg-white hover:text-black shrink-0 px-4 py-2 h-auto text-xs"
            >
              {isMatchPending ? 'SENT' : 'BEFRIEND'}
            </Button>
          </div>
        </DialogTrigger>
        <StudentModal student={student} avatarSrc={avatarSrc} onMatch={handleMatchRequest} isMatchPending={isMatchPending} displayName={displayName} />
      </Dialog>
    );
  }

  // Grid view
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="mx-auto w-full bg-[#fefefe] rounded-[1rem] p-2 text-[#141417] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform cursor-pointer flex flex-col h-full">
          <article className="w-full flex-1 flex flex-col">
            <section className="bg-primary/20 rounded-[0.5rem_0.5rem_0_0] p-6 text-sm border-2 border-black border-b-0 flex-1 flex flex-col">
              <header className="flex justify-between items-center font-bold mb-4">
                <span className="uppercase text-[10px] tracking-widest bg-white border-2 border-black px-2 py-1 shadow-neo-sm">
                  {student.profileCode?.startsWith('#') ? student.profileCode : `#${student.profileCode || 'NEW-USER'}`}
                </span>
                <div className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white rounded-full shadow-neo-sm overflow-hidden relative">
                  <User className="h-4 w-4" />
                </div>
              </header>
              <div className="flex-1 flex flex-col justify-end">
                <p className="mt-4 mb-2 text-3xl md:text-4xl font-black uppercase italic leading-none">{displayName}</p>
              </div>
            </section>
            
            <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 font-bold text-sm border-2 border-black bg-white rounded-[0_0_0.5rem_0.5rem] mt-auto">
              <div className="flex justify-start items-center gap-3 w-full">
                <div className="relative w-12 h-12 border-2 border-black bg-muted/10 flex items-center justify-center shrink-0 shadow-neo-sm rounded overflow-hidden">
                  <Image src={avatarSrc} alt="Avatar" fill className="object-cover" />
                </div>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="uppercase text-sm font-black italic leading-tight truncate">{student.major}</p>
                  <p className="uppercase text-[10px] text-muted-foreground mt-1 truncate">
                    {student.nativeLanguage} <span className="text-black">→</span> {student.targetLanguage}
                  </p>
                </div>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMatchRequest();
                }}
                disabled={isMatchPending}
                className="w-full sm:w-max font-black border-2 border-black px-6 py-3 bg-[#141417] text-white text-xs uppercase hover:bg-white hover:text-black hover:shadow-neo transition-all disabled:opacity-50 rounded-full h-auto"
              >
                {isMatchPending ? 'REQUEST SENT' : 'BEFRIEND'}
              </Button>
            </footer>
          </article>
        </div>
      </DialogTrigger>
      <StudentModal student={student} avatarSrc={avatarSrc} onMatch={handleMatchRequest} isMatchPending={isMatchPending} displayName={displayName} />
    </Dialog>
  );
}

function StudentModal({ student, avatarSrc, onMatch, isMatchPending, displayName }: any) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyCode = () => {
    const code = student.profileCode?.startsWith('#') ? student.profileCode : `#${student.profileCode || 'NEW-USER'}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DialogContent className="bg-white p-0 overflow-hidden max-w-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-primary/20 p-8 border-b-4 border-black relative">
         <button 
           onClick={handleCopyCode}
           className="absolute top-4 right-14 bg-white border-2 border-black px-3 py-1 font-black uppercase tracking-widest text-xs hidden sm:flex items-center gap-2 hover:bg-muted active:translate-y-[2px] transition-all"
         >
           {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
           {copied ? 'COPIED!' : (student.profileCode?.startsWith('#') ? student.profileCode : `#${student.profileCode || 'NEW-USER'}`)}
         </button>
         <div className="flex flex-col md:flex-row items-center gap-6 mt-4 sm:mt-0">
           <div className="relative w-32 h-32 md:w-40 md:h-40 border-4 border-black rounded-full overflow-hidden bg-white shadow-neo shrink-0">
             <Image src={avatarSrc} alt={displayName} fill className="object-cover" />
           </div>
           <div className="text-center md:text-left flex-1">
             <DialogTitle className="text-4xl md:text-6xl font-black uppercase italic leading-none mb-2">{displayName}</DialogTitle>
             <p className="text-xl font-bold uppercase italic text-muted-foreground flex items-center justify-center md:justify-start gap-2">
               <GraduationCap className="h-5 w-5" /> {student.major}
             </p>
           </div>
         </div>
      </div>
      
      <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-4 border-2 border-black bg-[#fafafa]">
             <h3 className="font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
               <Languages className="h-4 w-4" /> Languages
             </h3>
             <div className="space-y-2 font-bold uppercase text-sm">
               <p><span className="text-muted-foreground mr-2">Speaks:</span> {student.nativeLanguage}</p>
               <p><span className="text-muted-foreground mr-2">Learning:</span> {student.targetLanguage}</p>
             </div>
           </div>
           <div className="p-4 border-2 border-black bg-[#fafafa]">
             <h3 className="font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
               <Sparkles className="h-4 w-4" /> Interests
             </h3>
             <p className="font-bold uppercase text-sm">
               {student.hobbies || student.interests || 'Not specified'}
             </p>
           </div>
        </div>

        <div>
          <h3 className="font-black uppercase tracking-widest text-xs mb-3">About {displayName}</h3>
          <p className="font-medium whitespace-pre-wrap p-4 border-2 border-black border-dashed bg-white">
            {student.bio || student.about || 'This user has not written a bio yet.'}
          </p>
        </div>
        
        <div className="pt-4 border-t-2 border-black flex justify-end">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onMatch();
            }}
            disabled={isMatchPending}
            className="neo-button bg-primary text-xl px-8 py-6 group"
          >
            {isMatchPending ? 'REQUEST SENT' : 'SEND FRIEND REQUEST'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
