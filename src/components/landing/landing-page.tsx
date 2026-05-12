
"use client"

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Languages, GraduationCap, MapPin, Sparkles, ArrowRight, UserCheck, ShieldCheck, Database } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background selection:bg-accent selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/80 backdrop-blur-md border-b-2 border-black flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">{t('appName')}</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/pitch">
            <Button variant="ghost" className="hidden md:flex font-bold text-xs uppercase italic border-2 border-transparent hover:border-black">
              {t('forUni')}
            </Button>
          </Link>
          <LanguageSwitcher />
          <Button onClick={onGetStarted} className="neo-button bg-primary text-xs md:text-sm">
            {t('login')}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 md:px-8 text-center bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')] bg-repeat">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-accent px-4 py-1 border-2 border-black mb-8 font-black uppercase tracking-widest text-xs md:text-sm rotate-2">
            {t('exclusive')}
          </div>
          <h2 className="text-5xl sm:text-7xl md:text-9xl font-black leading-[0.85] mb-8 tracking-tighter italic">
            {t('heroTitle')}<br/>
            <span className="text-primary underline decoration-black underline-offset-8">{t('heroHighlight')}</span>
          </h2>
          <p className="text-lg md:text-2xl font-bold max-w-2xl mx-auto leading-tight mb-12 uppercase italic">
            {t('heroSub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={onGetStarted} className="w-full sm:w-auto neo-button text-lg md:text-2xl py-8 md:py-10 px-10 group bg-primary">
              {t('getStarted')} <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/pitch" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full neo-button-pink text-lg md:text-2xl py-8 md:py-10 px-10">
                {t('forUni')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 md:px-8 border-y-2 border-black bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-16 text-center">{t('howItWorks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LandingCard 
              icon={<UserCheck className="h-10 w-10" />} 
              title={t('step1Title')} 
              desc={t('step1Desc')} 
              bgColor="bg-primary/20"
            />
            <LandingCard 
              icon={<Sparkles className="h-10 w-10" />} 
              title={t('step2Title')} 
              desc={t('step2Desc')} 
              bgColor="bg-accent/20"
            />
            <LandingCard 
              icon={<MapPin className="h-10 w-10" />} 
              title={t('step3Title')} 
              desc={t('step3Desc')} 
              bgColor="bg-white"
            />
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 md:px-8 bg-primary/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="neo-card p-8 bg-primary rotate-[-1deg]">
              <div className="flex items-center gap-4 mb-4">
                <GraduationCap className="h-10 w-10" />
                <h3 className="text-3xl font-black uppercase italic">{t('beTeacher')}</h3>
              </div>
              <p className="text-lg font-bold leading-tight">{t('beTeacherDesc')}</p>
            </div>
            <div className="neo-card p-8 bg-accent rotate-[1deg]">
              <div className="flex items-center gap-4 mb-4">
                <Languages className="h-10 w-10" />
                <h3 className="text-3xl font-black uppercase italic">{t('beStudent')}</h3>
              </div>
              <p className="text-lg font-bold leading-tight">{t('beStudentDesc')}</p>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-auto h-[400px] md:h-[600px] border-4 border-black shadow-neo-lg overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
            <Image 
              src="https://picsum.photos/seed/trier-uni-landing/800/800" 
              alt="Trier Campus" 
              fill 
              className="object-cover" 
              data-ai-hint="university campus"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t-2 border-black bg-white px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{t('appName')}</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">{t('campusFocused')}</p>
          </div>
          <div className="flex gap-8 items-center text-[10px] md:text-xs font-black uppercase italic tracking-tighter">
            <Link href="/pitch" className="hover:text-accent underline underline-offset-4">FOR THE UNIVERSITY</Link>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> TRIER, GERMANY
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingCard({ icon, title, desc, bgColor }: any) {
  return (
    <div className={`neo-card p-8 ${bgColor} flex flex-col items-center text-center space-y-4`}>
      <div className="p-4 bg-white border-2 border-black mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase italic">{title}</h3>
      <p className="font-bold text-sm leading-tight text-muted-foreground">{desc}</p>
    </div>
  );
}
