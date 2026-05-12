
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
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiMatchCompatibilitySummaryOutput | null>(null);
  const [isMatchPending, setIsMatchPending] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const runAnalysis = async () => {
    setIsAIAnalyzing(true);
    try {
      const result = await aiMatchCompatibilitySummary({
        studentA: {
          name: currentUser.name,
          targetLanguage: currentUser.targetLanguage,
          nativeLanguage: currentUser.nativeLanguage,
          academicGoals: currentUser.academicGoals,
          socialGoals: currentUser.socialGoals,
        },
        studentB: {
          name: student.name,
          targetLanguage: student.targetLanguage,
          nativeLanguage: student.nativeLanguage,
          academicGoals: student.academicGoals,
          socialGoals: student.socialGoals,
        }
      });
      setAiSummary(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAIAnalyzing(false);
    }
  };

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
        title: "Match Request Sent!",
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
    <div className="neo-card bg-white flex flex-col overflow-hidden transition-all duration-300 sm:hover:rotate-1">
      <div className="flex flex-col md:flex-row border-b-2 border-black">
        {/* Profile Image */}
        <div className="w-full md:w-1/3 relative bg-muted border-b-2 md:border-b-0 md:border-r-2 border-black aspect-square md:aspect-auto">
          <Image 
            src={`https://picsum.photos/seed/${student.uid}/400/400`} 
            alt={student.name}
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute bottom-2 right-2 bg-primary px-2 py-0.5 md:px-3 md:py-1 border-2 border-black font-black text-sm md:text-xl shadow-neo-sm italic tracking-tighter">
            {student.profileCode}
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex-1 p-4 md:p-8">
          <div className="flex flex-col gap-2 mb-4 md:mb-6">
            <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">{student.name}</h3>
            <div className="flex items-center gap-2 text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">
              <GraduationCap className="h-3 w-3 md:h-4 w-4 shrink-0" /> {student.major} • Year {student.year}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-8">
            <div className="bg-primary/10 border-2 border-black px-2 py-1 md:px-3 md:py-2 flex items-center gap-2 md:gap-3">
              <span className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground italic">Fluent</span>
              <span className="font-bold text-sm md:text-lg">{student.nativeLanguage}</span>
            </div>
            <div className="bg-accent/10 border-2 border-black px-2 py-1 md:px-3 md:py-2 flex items-center gap-2 md:gap-3">
              <span className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground italic">Target</span>
              <span className="font-bold text-sm md:text-lg">{student.targetLanguage}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm md:text-base italic border-l-4 border-black pl-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
              "{student.academicGoals}"
            </p>
          </div>
        </div>
      </div>

      {/* AI Compatibility / Tabs Section */}
      <div className="flex-1 flex flex-col p-4 md:p-6 bg-[#fafafa]">
        {aiSummary ? (
          <div className="neo-card p-4 md:p-6 bg-white border-dashed mb-4 md:mb-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              <h4 className="font-black text-[10px] md:text-sm uppercase italic tracking-widest">AI Reciprocity Insight</h4>
            </div>
            <p className="text-sm md:text-base font-medium leading-relaxed mb-4 md:mb-6 italic">"{aiSummary.summary}"</p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {aiSummary.sharedInterests.map((interest, idx) => (
                <span key={idx} className="bg-muted px-2 py-0.5 border-2 border-black text-[10px] md:text-xs font-bold uppercase italic tracking-tight">{interest}</span>
              ))}
            </div>
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t-2 border-black border-dotted">
              <p className="text-[10px] md:text-xs font-bold uppercase flex items-center gap-2 md:gap-3 italic tracking-tight">
                <Languages className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" /> {aiSummary.reciprocalLanguageBenefit}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 md:mb-8 flex flex-col items-center justify-center p-6 md:p-10 border-2 border-black border-dashed bg-white text-center">
            <MessageSquareCode className="h-10 w-10 md:h-12 md:w-12 mb-4 text-muted-foreground opacity-30" />
            <p className="text-[10px] md:text-sm font-black text-muted-foreground uppercase mb-4 md:mb-6 tracking-widest italic opacity-50">Compare Profiles with AI</p>
            <Button 
              onClick={runAnalysis} 
              disabled={isAIAnalyzing}
              className="neo-button bg-white text-[10px] md:text-xs px-6 md:px-10 h-10 md:h-12 w-full sm:w-auto"
            >
              {isAIAnalyzing ? 'ANALYZING...' : 'PREVIEW COMPATIBILITY'}
            </Button>
          </div>
        )}

        <div className="mt-auto flex flex-col sm:flex-row gap-4 items-center pt-4 md:pt-6 border-t-2 border-black border-dotted">
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="text-[10px] md:text-xs font-black underline underline-offset-4 uppercase tracking-tighter hover:text-accent transition-colors flex items-center gap-2 italic"
          >
            <Calendar className="h-4 w-4 md:h-5 md:w-5" /> {showHeatmap ? 'HIDE SCHEDULE' : 'SHOW OVERLAP'}
          </button>
          
          <div className="ml-auto w-full sm:w-auto">
            {isMatchPending ? (
              <Button disabled className="w-full sm:w-auto neo-button bg-muted italic text-[10px] md:text-sm">
                REQUEST PENDING
              </Button>
            ) : (
              <Button 
                onClick={handleMatchRequest}
                className="w-full sm:w-auto neo-button bg-primary px-6 md:px-8 h-12 md:h-14 text-sm"
              >
                INITIATE EXCHANGE <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {showHeatmap && (
          <div className="mt-6 md:mt-8 p-4 md:p-6 neo-card bg-white animate-in slide-in-from-bottom-4">
            <h5 className="text-[8px] md:text-[10px] font-black uppercase mb-4 md:mb-6 flex items-center gap-2 md:gap-3 tracking-widest">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-accent border-2 border-black" /> Potential Meeting Heatmap
            </h5>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {Array(21).fill(0).map((_, idx) => {
                const isOverlapping = student.availability?.[idx] && currentUser.availability?.[idx];
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "aspect-square border border-black md:border-2 transition-all",
                      isOverlapping ? "bg-accent" : "bg-muted/10"
                    )}
                  />
                );
              })}
            </div>
            <p className="text-[8px] md:text-[10px] font-bold text-center mt-4 uppercase italic opacity-60">Colored blocks represent shared free time in Mensa/Library slots.</p>
          </div>
        )}
      </div>
    </div>
  );
}
