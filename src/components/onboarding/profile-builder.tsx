
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { LogOut, ChevronRight, ChevronLeft, MapPin, Globe, Sparkles, Calendar, Lock, GraduationCap as GradCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileBuilderProps {
  user: any;
  onComplete: (data: any) => void;
  onLogout: () => void;
}

export function ProfileBuilder({ user, onComplete, onLogout }: ProfileBuilderProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    major: '',
    year: '',
    nativeLanguage: '',
    targetLanguage: '',
    academicGoals: '',
    socialGoals: '',
    availability: Array(21).fill(false), // 7x3 grid
    instagram: '',
    telegram: '',
    showContactOnMatch: true
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleAvailability = (index: number) => {
    const newAvail = [...formData.availability];
    newAvail[index] = !newAvail[index];
    setFormData({ ...formData, availability: newAvail });
  };

  const isStepValid = () => {
    if (step === 1) return formData.major && formData.year;
    if (step === 2) return formData.nativeLanguage && formData.targetLanguage;
    if (step === 3) return formData.academicGoals.length >= 20 && formData.socialGoals.length >= 20;
    return true;
  };

  const handleFinish = () => {
    onComplete(formData);
  };

  const majors = [
    "Computer Science", "Business Informatics", "Law", "Psychology", 
    "Economics", "History", "Literature", "Digital Humanities", "Biology"
  ];

  const languages = ["German", "English", "French", "Spanish", "Chinese", "Italian", "Turkish", "Arabic", "Japanese", "Russian"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col">
      <header className="flex justify-between items-center mb-8 md:mb-12">
        <div className="shrink-0">
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic leading-none">Building Profile</h2>
          <p className="font-bold text-muted-foreground text-xs md:text-sm">Step {step} of 5</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="font-bold border-2 border-black text-xs h-8 md:h-10">
          <LogOut className="mr-2 h-3 w-3 md:h-4 md:w-4" /> Exit
        </Button>
      </header>

      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-8 md:mb-12">
          <Progress value={(step / 5) * 100} className="h-4 md:h-6 border-2 border-black bg-white" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-primary p-2 md:p-3 border-2 border-black shrink-0">
                  <GradCap className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black italic leading-tight">Who are you at Uni Trier?</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] md:text-xs">Current Major</Label>
                  <Select onValueChange={(v) => setFormData({...formData, major: v})} value={formData.major}>
                    <SelectTrigger className="neo-input h-12 md:h-14 text-base md:text-lg">
                      <SelectValue placeholder="Select Major" />
                    </SelectTrigger>
                    <SelectContent>
                      {majors.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] md:text-xs">Study Year</Label>
                  <Select onValueChange={(v) => setFormData({...formData, year: v})} value={formData.year}>
                    <SelectTrigger className="neo-input h-12 md:h-14 text-base md:text-lg">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year (Bachelors)</SelectItem>
                      <SelectItem value="2">2nd Year (Bachelors)</SelectItem>
                      <SelectItem value="3">3rd Year (Bachelors)</SelectItem>
                      <SelectItem value="4">Masters (1st Year)</SelectItem>
                      <SelectItem value="5">Masters (2nd Year)</SelectItem>
                      <SelectItem value="6">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-accent p-2 md:p-3 border-2 border-black shrink-0">
                  <Globe className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black italic leading-tight">Linguistic Exchange</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="neo-card p-4 md:p-6 bg-primary/20">
                  <Label className="font-bold uppercase text-[10px] md:text-xs mb-3 md:mb-4 block">I Can Teach (Native)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
                    {languages.map(lang => (
                      <button 
                        key={lang}
                        onClick={() => setFormData({...formData, nativeLanguage: lang})}
                        className={cn(
                          "p-2 text-xs font-bold border-2 border-black transition-all",
                          formData.nativeLanguage === lang ? "bg-primary shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white shadow-neo-sm"
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="neo-card p-4 md:p-6 bg-accent/20">
                  <Label className="font-bold uppercase text-[10px] md:text-xs mb-3 md:mb-4 block">I Want To Learn</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
                    {languages.map(lang => (
                      <button 
                        key={lang}
                        onClick={() => setFormData({...formData, targetLanguage: lang})}
                        className={cn(
                          "p-2 text-xs font-bold border-2 border-black transition-all",
                          formData.targetLanguage === lang ? "bg-accent shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white shadow-neo-sm"
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-primary p-2 md:p-3 border-2 border-black shrink-0">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black italic leading-tight">Tell us your Goals</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] md:text-xs">Academic Goals & Interests</Label>
                  <Textarea 
                    placeholder="e.g. I want to study for the Law exams together and learn German terminology..." 
                    className="neo-input min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                    value={formData.academicGoals}
                    onChange={(e) => setFormData({...formData, academicGoals: e.target.value})}
                  />
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground">{formData.academicGoals.length}/20 min chars</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] md:text-xs">Social Goals & Activities</Label>
                  <Textarea 
                    placeholder="e.g. I love hiking in the vineyards near Trier and want to talk about films..." 
                    className="neo-input min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                    value={formData.socialGoals}
                    onChange={(e) => setFormData({...formData, socialGoals: e.target.value})}
                  />
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground">{formData.socialGoals.length}/20 min chars</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-accent p-2 md:p-3 border-2 border-black shrink-0">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black italic leading-tight">Campus Availability</h3>
              </div>
              <div className="neo-card p-4 md:p-6 bg-white overflow-hidden overflow-x-auto">
                <div className="min-w-[400px]">
                  <div className="grid grid-cols-8 gap-2 mb-2">
                    <div className="text-[8px] md:text-[10px] font-black uppercase text-center">Time</div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="text-[8px] md:text-[10px] font-black uppercase text-center">{d}</div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {['Morning', 'Afternoon', 'Evening'].map((time, tIdx) => (
                      <div key={time} className="grid grid-cols-8 gap-2 items-center">
                        <div className="text-[8px] md:text-[10px] font-black uppercase text-right leading-tight pr-2">{time}</div>
                        {[0, 1, 2, 3, 4, 5, 6].map(dIdx => {
                          const cellIdx = tIdx * 7 + dIdx;
                          return (
                            <button
                              key={dIdx}
                              onClick={() => toggleAvailability(cellIdx)}
                              className={cn(
                                "aspect-square border border-black md:border-2 transition-all",
                                formData.availability[cellIdx] ? "bg-primary" : "bg-muted"
                              )}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[10px] md:text-sm font-bold bg-white p-3 border-2 border-black text-center italic">
                Click slots to highlight when you are usually free for a coffee at Mensa.
              </p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-primary p-2 md:p-3 border-2 border-black shrink-0">
                  <Lock className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black italic leading-tight">Contact Privacy</h3>
              </div>
              <div className="space-y-6">
                <div className="neo-card p-4 md:p-8 bg-white space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold uppercase text-[10px] md:text-xs">Instagram Username</Label>
                      <Input 
                        placeholder="@username" 
                        className="neo-input h-12"
                        value={formData.instagram}
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold uppercase text-[10px] md:text-xs">Telegram Handle</Label>
                      <Input 
                        placeholder="@t_username" 
                        className="neo-input h-12"
                        value={formData.telegram}
                        onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t-2 border-black">
                    <button 
                      onClick={() => setFormData({...formData, showContactOnMatch: !formData.showContactOnMatch})}
                      className={cn(
                        "w-10 h-5 md:w-12 md:h-6 border-2 border-black relative transition-colors shrink-0",
                        formData.showContactOnMatch ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 md:top-1 w-2 md:w-2 h-3 md:h-2 bg-black transition-all",
                        formData.showContactOnMatch ? "left-6 md:left-8" : "left-1"
                      )} />
                    </button>
                    <Label className="font-bold text-xs md:text-sm">Reveal contact handles only after mutual match acceptance.</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 md:mt-12 py-4 md:py-8 border-t-2 border-black flex justify-between items-center bg-white p-4 neo-card shrink-0">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={step === 1}
            className="neo-button bg-white disabled:opacity-50 h-10 md:h-12 text-xs md:text-sm px-4 md:px-6"
          >
            <ChevronLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> BACK
          </Button>
          
          {step < 5 ? (
            <Button 
              onClick={nextStep} 
              disabled={!isStepValid()}
              className="neo-button min-w-[100px] md:min-w-[120px] h-10 md:h-12 text-xs md:text-sm px-4 md:px-6"
            >
              NEXT <ChevronRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinish} 
              className="neo-button bg-accent min-w-[100px] md:min-w-[120px] h-10 md:h-12 text-xs md:text-sm px-4 md:px-6"
            >
              LAUNCH! <Sparkles className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
