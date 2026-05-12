
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Languages, Calendar, GraduationCap, Instagram, Send, CheckCircle2, Lock, ChevronRight, MessageSquareCode } from 'lucide-react';
import { aiMatchCompatibilitySummary, type AiMatchCompatibilitySummaryOutput } from '@/ai/flows/ai-match-compatibility-summary';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MatchCardProps {
  currentUser: any;
  student: any;
}

export function MatchCard({ currentUser, student }: MatchCardProps) {
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiMatchCompatibilitySummaryOutput | null>(null);
  const [isMatchMutuallyAccepted, setIsMatchMutuallyAccepted] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

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

  const handleMatch = () => {
    setIsMatchMutuallyAccepted(true);
  };

  return (
    <div className="neo-card bg-white flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row border-b-2 border-black">
        {/* Profile Image */}
        <div className="md:w-1/3 relative bg-muted border-b-2 md:border-b-0 md:border-r-2 border-black aspect-square">
          <Image 
            src={`https://picsum.photos/seed/${student.id}/400/400`} 
            alt={student.name}
            fill
            className="object-cover grayscale"
            data-ai-hint="student university"
          />
          {student.isNew && (
            <div className="absolute top-2 left-2 bg-accent px-2 py-0.5 border-2 border-black font-black text-[10px] uppercase">New Profile</div>
          )}
          <div className="absolute bottom-2 right-2 bg-primary px-3 py-1 border-2 border-black font-black text-xl shadow-neo-sm">
            {student.matchScore}%
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-1">{student.name}</h3>
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase">
                <GraduationCap className="h-4 w-4" /> {student.major} • Year {student.year}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="bg-primary/20 border-2 border-black px-2 py-1 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground">Teaches</span>
              <span className="font-bold">{student.nativeLanguage}</span>
            </div>
            <div className="bg-accent/20 border-2 border-black px-2 py-1 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground">Learning</span>
              <span className="font-bold">{student.targetLanguage}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-[10px] font-black uppercase mb-1 block">Academic Focus</Label>
              <p className="text-sm italic border-l-4 border-primary pl-3 line-clamp-2">{student.academicGoals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Compatibility / Tabs Section */}
      <div className="flex-1 flex flex-col p-4 md:p-6 bg-[#fafafa]">
        {aiSummary ? (
          <div className="neo-card p-4 bg-white border-dashed mb-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <h4 className="font-black text-xs uppercase italic tracking-wider">AI Compatibility Summary</h4>
            </div>
            <p className="text-sm font-medium leading-relaxed mb-4">{aiSummary.summary}</p>
            <div className="flex flex-wrap gap-2">
              {aiSummary.sharedInterests.map((interest, idx) => (
                <span key={idx} className="bg-muted px-2 py-0.5 border-2 border-black text-[10px] font-bold uppercase">{interest}</span>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-black border-dotted">
              <p className="text-[11px] font-bold uppercase flex items-center gap-2">
                <Languages className="h-3 w-3" /> {aiSummary.reciprocalLanguageBenefit}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex flex-col items-center justify-center p-6 border-2 border-black border-dashed bg-white">
            <MessageSquareCode className="h-10 w-10 mb-2 text-muted-foreground" />
            <p className="text-xs font-bold text-muted-foreground uppercase mb-4">Run AI Match Reasoner</p>
            <Button 
              onClick={runAnalysis} 
              disabled={isAIAnalyzing}
              className="neo-button bg-white text-xs"
            >
              {isAIAnalyzing ? 'Analyzing Reciprocity...' : 'GENERATE AI SUMMARY'}
            </Button>
          </div>
        )}

        <div className="mt-auto flex flex-col md:flex-row gap-4 items-center pt-4 border-t-2 border-black border-dotted">
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="text-xs font-black underline underline-offset-4 uppercase tracking-tighter hover:text-accent transition-colors flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" /> {showHeatmap ? 'Hide Schedule' : 'View Overlap Heatmap'}
          </button>
          
          <div className="flex gap-2 ml-auto w-full md:w-auto">
            {isMatchMutuallyAccepted ? (
              <div className="flex gap-2 w-full animate-in slide-in-from-right-4">
                <div className="neo-card bg-accent p-2 flex items-center justify-center gap-2 flex-1">
                  <Instagram className="h-4 w-4" />
                  <span className="text-xs font-bold">{student.instagram || '@trier_student'}</span>
                </div>
                <div className="neo-card bg-primary p-2 flex items-center justify-center gap-2 flex-1">
                  <Send className="h-4 w-4" />
                  <span className="text-xs font-bold">{student.telegram || 'Telegram'}</span>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleMatch}
                className="w-full md:w-auto neo-button bg-primary"
              >
                SEND MATCH REQUEST <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Heatmap Overlay */}
        {showHeatmap && (
          <div className="mt-6 p-4 neo-card bg-white animate-in fade-in duration-300">
            <h5 className="text-[10px] font-black uppercase mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-accent border-2 border-black" /> Potential Meeting Slots (Overlapping Free Time)
            </h5>
            <div className="grid grid-cols-7 gap-1">
              {Array(21).fill(0).map((_, idx) => {
                const isOverlapping = student.availability[idx] && currentUser.availability?.[idx];
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "aspect-square border-2 border-black",
                      isOverlapping ? "bg-accent" : "bg-muted/30"
                    )}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("font-bold text-muted-foreground", className)}>{children}</span>;
}
