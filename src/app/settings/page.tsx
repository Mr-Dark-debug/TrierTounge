"use client"

import { useState, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ArrowLeft, Save, Shield, User, Bell, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Loader from '@/components/ui/loader';
import { faculties, englishMasters, campuses, residentialAreas, dorms } from '@/lib/trier-data';

const languages = ["German", "English", "French", "Spanish", "Chinese", "Italian", "Turkish", "Arabic", "Japanese", "Russian"];

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const { data: profile, loading } = useDoc(
    user && db ? doc(db, 'users', user.uid) : null
  );

  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        faculty: profile.faculty || '',
        major: profile.major || '',
        year: profile.year || '',
        isEnglishProgramme: profile.isEnglishProgramme || false,
        englishProgramme: profile.englishProgramme || '',
        campus: profile.campus || '',
        residentialArea: profile.residentialArea || '',
        dorm: profile.dorm || '',
        nativeLanguage: profile.nativeLanguage || '',
        targetLanguage: profile.targetLanguage || '',
        academicGoals: profile.academicGoals || '',
        socialGoals: profile.socialGoals || '',
        availability: Array.isArray(profile.availability) && profile.availability.length === 21 ? profile.availability : Array(21).fill(false),
        instagram: profile.instagram || '',
        telegram: profile.telegram || '',
        whatsapp: profile.whatsapp || '',
        discord: profile.discord || '',
        signal: profile.signal || '',
        otherContactLabel: profile.otherContactLabel || '',
        otherContactHandle: profile.otherContactHandle || '',
        showContactOnMatch: profile.showContactOnMatch ?? true,
      });
    }
  }, [profile]);

  const selectedFaculty = faculties.find(f => f.name === formData?.faculty);

  const toggleAvailability = (index: number) => {
    const next = [...formData.availability];
    next[index] = !next[index];
    setFormData({ ...formData, availability: next });
  };

  const handleSave = async () => {
    if (!db || !user || !formData) return;

    const normalizedName = formData.name.trim() || user.displayName || user.email?.split('@')[0] || 'New User';
    const payload = {
      ...formData,
      name: normalizedName,
      uid: user.uid,
      email: user.email,
      isVerified: profile?.isVerified ?? true,
      onboardingCompleted: true,
      createdAt: profile?.createdAt || new Date().toISOString(),
      profileCode: profile?.profileCode || `#${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    };

    try {
      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
      toast({
        title: t('settingsSaved'),
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message
      });
    }
  };

  if (loading || !formData) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] p-4 md:p-8 selection:bg-accent selection:text-white">
      <nav className="max-w-6xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="neo-button bg-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">{t('settingsTitle')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/feedback">
            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase italic border-2 border-transparent hover:border-black gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-4">
          <div className="neo-card bg-primary p-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <h3 className="font-black uppercase italic text-sm">Profile Data</h3>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <Bell className="h-6 w-6" />
              <h3 className="font-black uppercase italic text-sm">Notifications</h3>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <Shield className="h-6 w-6" />
              <h3 className="font-black uppercase italic text-sm">Security</h3>
            </div>
          </div>
          
          <div className="p-4 border-2 border-black border-dashed bg-white text-center">
            <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Your Campus ID</span>
            <span className="text-xl font-black tracking-widest">{profile?.profileCode || '...'}</span>
          </div>
        </aside>

        <section className="md:col-span-3 space-y-8">
          <div className="neo-card bg-white p-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-black italic uppercase">Identity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="neo-input"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Study Year</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, year: v })} value={formData.year}>
                    <SelectTrigger className="neo-input h-12">
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
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Faculty</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, faculty: v, major: '' })} value={formData.faculty}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Department / Subject</Label>
                  <Select
                    onValueChange={(v) => setFormData({ ...formData, major: v })}
                    value={formData.major}
                    disabled={!formData.faculty}
                  >
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder={formData.faculty ? "Select Subject" : "Select Faculty first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFaculty?.subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t-2 border-black pt-8">
              <h2 className="text-2xl font-black italic uppercase">Programme</h2>
              <div className="flex items-center gap-4 py-2">
                <Switch
                  checked={formData.isEnglishProgramme}
                  onCheckedChange={(v) => setFormData({ ...formData, isEnglishProgramme: v, englishProgramme: v ? formData.englishProgramme : '' })}
                />
                <Label className="font-bold text-xs uppercase italic">I am in an English-taught Master's Programme</Label>
              </div>
              {formData.isEnglishProgramme && (
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">English Programme</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, englishProgramme: v })} value={formData.englishProgramme}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Select Programme" />
                    </SelectTrigger>
                    <SelectContent>
                      {englishMasters.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-4 border-t-2 border-black pt-8">
              <h2 className="text-2xl font-black italic uppercase">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Primary Campus</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, campus: v })} value={formData.campus}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Select Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Residential Area</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, residentialArea: v })} value={formData.residentialArea}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {residentialAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Dormitory</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, dorm: v })} value={formData.dorm}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Select Dorm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not in a Dorm</SelectItem>
                      {dorms.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t-2 border-black pt-8">
              <h2 className="text-2xl font-black italic uppercase">Languages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Native Language</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, nativeLanguage: v })} value={formData.nativeLanguage}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Target Language</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, targetLanguage: v })} value={formData.targetLanguage}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t-2 border-black pt-8">
              <h2 className="text-2xl font-black italic uppercase">Goals</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Academic Goals</Label>
                  <Textarea
                    value={formData.academicGoals}
                    onChange={(e) => setFormData({ ...formData, academicGoals: e.target.value })}
                    className="neo-input min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Social Goals</Label>
                  <Textarea
                    value={formData.socialGoals}
                    onChange={(e) => setFormData({ ...formData, socialGoals: e.target.value })}
                    className="neo-input min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t-2 border-black pt-8">
              <h2 className="text-2xl font-black italic uppercase">Availability</h2>
              <div className="neo-card p-4 bg-[#fafafa] overflow-x-auto">
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
                              type="button"
                              key={dIdx}
                              onClick={() => toggleAvailability(cellIdx)}
                              className={formData.availability[cellIdx] ? "aspect-square border-2 border-black bg-primary" : "aspect-square border-2 border-black bg-muted"}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t-2 border-black pt-8">
              <h2 className="text-2xl font-black italic uppercase">Contact Handles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Instagram</Label>
                  <Input value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} className="neo-input" placeholder="@username" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Telegram</Label>
                  <Input value={formData.telegram} onChange={(e) => setFormData({...formData, telegram: e.target.value})} className="neo-input" placeholder="@handle" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">WhatsApp</Label>
                  <Input value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="neo-input" placeholder="+49..." />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Discord</Label>
                  <Input value={formData.discord} onChange={(e) => setFormData({...formData, discord: e.target.value})} className="neo-input" placeholder="@discord" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Signal</Label>
                  <Input value={formData.signal} onChange={(e) => setFormData({...formData, signal: e.target.value})} className="neo-input" placeholder="+49..." />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Other Contact Label</Label>
                  <Input value={formData.otherContactLabel} onChange={(e) => setFormData({...formData, otherContactLabel: e.target.value})} className="neo-input" placeholder="e.g. WeChat" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold uppercase text-xs">Other Contact Handle</Label>
                  <Input value={formData.otherContactHandle} onChange={(e) => setFormData({...formData, otherContactHandle: e.target.value})} className="neo-input" placeholder="Your username or handle" />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t-2 border-black">
                <Switch
                  checked={formData.showContactOnMatch}
                  onCheckedChange={(v) => setFormData({ ...formData, showContactOnMatch: v })}
                />
                <Label className="font-bold text-xs uppercase italic">Reveal handles only after mutual match acceptance.</Label>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full neo-button bg-primary py-8 text-xl group">
              {t('saveSettings')} <Save className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
