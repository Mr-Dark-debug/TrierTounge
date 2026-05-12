
"use client"

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Languages, Sparkles, MapPin, Instagram, Send, Edit, ShieldCheck, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import teacherImg from '@/assets/teacher-img.jpg';
import studentImg from '@/assets/student-img.jpg';

export function ProfileTab({ profile }: { profile: any }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-primary px-2 py-0.5 border-2 border-black tracking-widest">Settings & Identity</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
            {t('yourProfile').split('.')[0]}<br/>PROFILE.
          </h2>
        </div>
        <Link href="/settings">
          <Button className="neo-button bg-white h-14 px-8 flex items-center gap-2">
            <Edit className="h-5 w-5" /> {t('editDetails')}
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Identity Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="neo-card bg-white p-6 text-center space-y-6">
            <div className="relative h-48 w-48 mx-auto border-2 border-black bg-muted grayscale">
              <Image 
                src={`https://picsum.photos/seed/${profile.uid}/400/400`} 
                alt={profile.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">{profile.name}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{profile.major}</p>
              <p className="text-[10px] font-black text-primary uppercase">Year {profile.year}</p>
            </div>
            <div className="p-4 bg-primary/20 border-2 border-black border-dashed">
              <span className="text-[10px] font-black uppercase block mb-1">{t('profileCode')}</span>
              <span className="text-2xl font-black tracking-widest font-code">{profile.profileCode}</span>
            </div>
          </div>

          <div className="neo-card bg-white p-6 space-y-4">
            <h4 className="font-black italic uppercase border-b-2 border-black pb-2 text-sm tracking-widest">Location Info</h4>
            <div className="flex items-center gap-3 p-3 bg-muted/10 border-2 border-black">
              <Building2 className="h-5 w-5 text-accent" />
              <div>
                <p className="text-[8px] font-black uppercase text-muted-foreground">Primary Campus</p>
                <p className="font-bold text-sm">{profile.campus}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/10 border-2 border-black">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[8px] font-black uppercase text-muted-foreground">Area / Residence</p>
                <p className="font-bold text-sm">{profile.dorm && profile.dorm !== 'none' ? profile.dorm : profile.residentialArea}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Goals */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="neo-card bg-primary p-6 space-y-4">
              <div className="relative h-16 w-16 border-2 border-black overflow-hidden bg-white">
                <Image src={teacherImg} alt="Teacher" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-xl font-black italic uppercase">{t('beTeacher')}</h4>
                <p className="font-bold text-2xl tracking-tighter uppercase leading-none">{profile.nativeLanguage}</p>
              </div>
            </div>
            <div className="neo-card bg-accent p-6 space-y-4">
              <div className="relative h-16 w-16 border-2 border-black overflow-hidden bg-white">
                <Image src={studentImg} alt="Student" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-xl font-black italic uppercase">{t('beStudent')}</h4>
                <p className="font-bold text-2xl tracking-tighter uppercase leading-none">{profile.targetLanguage}</p>
              </div>
            </div>
          </div>

          <div className="neo-card bg-white p-8 space-y-8">
            {profile.isEnglishProgramme && (
              <div className="p-4 bg-black text-white border-2 border-black mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">English Taught Master's</span>
                <p className="text-lg font-black italic uppercase">{profile.englishProgramme}</p>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-black uppercase mb-4 text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Academic Focus Area
              </h4>
              <p className="text-xl font-medium leading-relaxed italic border-l-4 border-black pl-6">
                "{profile.academicGoals}"
              </p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase mb-4 text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Social & Local Goals
              </h4>
              <p className="text-xl font-medium leading-relaxed italic border-l-4 border-accent pl-6">
                "{profile.socialGoals}"
              </p>
            </div>
          </div>

          <div className="neo-card bg-black text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-10 w-10 text-primary shrink-0" />
              <div>
                <h4 className="font-black italic uppercase text-lg leading-none mb-1">{t('safetyPrivacy')}</h4>
                <p className="text-xs text-white/60">Your handles (Instagram: {profile.instagram || 'None'}, Telegram: {profile.telegram || 'None'}) are shared only with mutual matches.</p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="outline" className="w-full md:w-auto border-white text-white hover:bg-white hover:text-black neo-button bg-transparent">
                {t('settings')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
