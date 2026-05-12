
"use client"

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { 
  Languages, GraduationCap, MapPin, Sparkles, ArrowRight, UserCheck, 
  Globe, ShieldCheck, LocateFixed, HeartHandshake, Coffee, Library, 
  TreePine, Building, Home, Users, BookOpen, AppWindow, MessageCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
          <h2 className="text-5xl sm:text-7xl md:text-9xl font-black leading-[0.85] mb-8 tracking-tighter italic text-black">
            {t('heroTitle')}<br/>
            <span className="text-accent underline decoration-black underline-offset-8">{t('heroHighlight')}</span>
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
      <section className="py-20 px-4 md:px-8 bg-white border-t-2 border-black">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4">01 — Process</p>
          <h2 className="text-5xl md:text-8xl font-black leading-[0.85] uppercase tracking-tighter italic mb-12">
            {t('howItWorks').split(' ')[0]}
            <br />
            {t('howItWorks').split(' ').slice(1).join(' ')}
          </h2>
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

      {/* Trust & Exclusivity Section - REDESIGNED */}
      <section className="py-24 px-4 md:px-8 bg-black text-primary border-y-[4px] border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20">
            <div className="space-y-6">
              <p className="text-xs font-black uppercase tracking-[0.4em] bg-primary text-black px-3 py-1 w-fit rotate-[-1deg]">
                02 — SECURITY PROTOCOL
              </p>
              <h2 className="text-6xl md:text-[10rem] font-black leading-[0.75] uppercase tracking-tighter italic text-primary">
                SAFE.<br />
                EXCLUSIVE.<br />
                TRIER-ONLY.
              </h2>
            </div>
            <div className="lg:pt-20">
               <div className="p-4 md:p-8 border-4 border-primary bg-primary/10 text-primary rotate-2 max-w-sm">
                 <ShieldCheck className="h-16 w-16 mb-6" />
                 <p className="text-2xl font-black uppercase italic leading-none">{t('trustTitle')}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-primary divide-y-4 md:divide-y-0 md:divide-x-4 divide-primary overflow-hidden">
            <div className="p-8 md:p-12 hover:bg-primary hover:text-black transition-colors group cursor-default">
              <div className="flex items-center gap-4 mb-8">
                 <span className="text-4xl font-black font-code group-hover:text-black">01</span>
                 <UserCheck className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black uppercase italic mb-4 leading-tight">{t('trust1Title')}</h3>
              <p className="font-bold text-sm uppercase leading-relaxed opacity-80 group-hover:opacity-100">{t('trust1Desc')}</p>
            </div>

            <div className="p-8 md:p-12 hover:bg-primary hover:text-black transition-colors group cursor-default">
              <div className="flex items-center gap-4 mb-8">
                 <span className="text-4xl font-black font-code group-hover:text-black">02</span>
                 <LocateFixed className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black uppercase italic mb-4 leading-tight">{t('trust2Title')}</h3>
              <p className="font-bold text-sm uppercase leading-relaxed opacity-80 group-hover:opacity-100">{t('trust2Desc')}</p>
            </div>

            <div className="p-8 md:p-12 hover:bg-primary hover:text-black transition-colors group cursor-default">
              <div className="flex items-center gap-4 mb-8">
                 <span className="text-4xl font-black font-code group-hover:text-black">03</span>
                 <HeartHandshake className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black uppercase italic mb-4 leading-tight">{t('trust3Title')}</h3>
              <p className="font-bold text-sm uppercase leading-relaxed opacity-80 group-hover:opacity-100">{t('trust3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Hotspots Section */}
      <section className="py-20 px-4 md:px-8 bg-white border-t-2 border-black">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4">03 — Locations</p>
          <h2 className="text-5xl md:text-8xl font-black leading-[0.85] uppercase tracking-tighter italic mb-12">
            WHERE<br />IT<br />HAPPENS.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SpotCard icon={<Coffee />} title={t('spot1Title')} desc={t('spot1Desc')} color="bg-primary" />
            <SpotCard icon={<Library />} title={t('spot2Title')} desc={t('spot2Desc')} color="bg-accent" />
            <SpotCard icon={<TreePine />} title={t('spot3Title')} desc={t('spot3Desc')} color="bg-primary/20" />
            <SpotCard icon={<Building />} title={t('spot4Title')} desc={t('spot4Desc')} color="bg-accent/20" />
            <SpotCard icon={<Home />} title={t('spot5Title')} desc={t('spot5Desc')} color="bg-white" />
          </div>
        </div>
      </section>

      {/* Language Spotlight Section */}
      <section className="py-24 px-4 md:px-8 bg-accent text-black border-t-2 border-black">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.4em] mb-4">04 — DIVERSITY</p>
          <h2 className="text-[clamp(3.5rem,12vw,14rem)] font-black leading-[0.75] uppercase tracking-tighter italic break-words mb-12">
            {t('langSpotlightTitle')}
          </h2>
          
          <div className="flex flex-wrap gap-x-6 md:gap-x-12 gap-y-4 mb-20">
            {[t('langMandarin'), t('langJapanese'), t('langFrench'), t('langGlobal'), t('langGerman')].map((lang, i) => {
              const mainName = lang.split(' ')[0].replace('(', '');
              return (
                <div key={i} className="group relative cursor-default">
                  <span className="text-[clamp(2.5rem,8vw,10rem)] font-black uppercase italic tracking-tighter leading-none hover:text-white transition-colors duration-200 block">
                    {mainName}
                  </span>
                  <div className="absolute -top-4 left-0 bg-black text-white px-2 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {lang}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pt-10 border-t-4 border-black">
            <p className="text-2xl md:text-4xl font-black uppercase italic leading-tight max-w-2xl">
              {t('langSpotlightSub')}
            </p>
            <div className="hidden lg:block shrink-0 p-4 border-4 border-black bg-black text-white rotate-3 hover:rotate-0 transition-transform">
               <Globe className="h-16 w-16 animate-spin-slow" />
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 md:px-8 bg-background border-y-2 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* Teacher Card */}
            <div 
              className="neo-card p-8 md:p-10 bg-white flex flex-col flex-1 transition-all duration-300 cursor-pointer group hover:bg-accent"
              onClick={onGetStarted}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-white border-2 border-black shadow-neo-sm group-hover:bg-black group-hover:text-white transition-colors">
                  <GraduationCap className="h-10 w-10" />
                </div>
                <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{t('beTeacher')}</h3>
              </div>
              <p className="text-xl md:text-2xl font-bold leading-tight italic mb-8">{t('beTeacherDesc')}</p>
              <Button className="mt-auto neo-button bg-white text-black w-fit text-xl py-8 px-10 uppercase italic tracking-tighter border-2 border-black hover:bg-black hover:text-primary transition-colors">
                {t('letsGo')} <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
            
            {/* Student Card */}
            <div 
              className="neo-card p-8 md:p-10 bg-white flex flex-col flex-1 transition-all duration-300 cursor-pointer group hover:bg-primary"
              onClick={onGetStarted}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-white border-2 border-black shadow-neo-sm group-hover:bg-black group-hover:text-white transition-colors">
                  <Languages className="h-10 w-10" />
                </div>
                <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{t('beStudent')}</h3>
              </div>
              <p className="text-xl md:text-2xl font-bold leading-tight italic mb-8">{t('beStudentDesc')}</p>
              <Button className="mt-auto neo-button bg-white text-black w-fit text-xl py-8 px-10 uppercase italic tracking-tighter border-2 border-black hover:bg-black hover:text-accent transition-colors">
                {t('letsGo')} <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Async Section */}
      <section className="py-24 px-4 md:px-8 bg-primary text-black border-b-2 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
           <div className="neo-card bg-white p-6 rotate-[-2deg] shrink-0 border-4">
             <MessageCircle className="h-24 w-24" />
           </div>
           <div className="space-y-6">
             <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-none">{t('asyncTitle')}</h2>
             <p className="text-xl md:text-2xl font-bold italic max-w-2xl">{t('asyncDesc')}</p>
           </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 px-4 md:px-8 bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="flex-1 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">
                {t('aboutUsTitle')}
              </h2>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="space-y-6 flex-1">
                  <p className="text-xl md:text-2xl font-bold leading-tight uppercase italic border-l-8 border-primary pl-6">
                    {t('aboutUsDesc')}
                  </p>
                  <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                    {t('aboutUsMission')}
                  </p>
                </div>
                
                <div className="shrink-0">
                  <div className="neo-card bg-primary p-1 -rotate-3 hover:rotate-0 transition-transform">
                    <div className="relative w-32 h-32 md:w-48 md:h-48 border-2 border-black overflow-hidden grayscale contrast-125">
                      <Image 
                        src="https://picsum.photos/seed/trier-about/400/400" 
                        alt="About TrierTongue" 
                        width={400}
                        height={400}
                        className="object-cover"
                        data-ai-hint="portrait illustration"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Block */}
      <section className="py-24 px-4 md:px-8 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black italic uppercase text-center mb-16 tracking-widest text-zinc-500">{t('statsTitle')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
             <StatItem icon={<Users />} text={t('stat1')} />
             <StatItem icon={<BookOpen />} text={t('stat2')} />
             <StatItem icon={<Sparkles />} text={t('stat3')} />
             <StatItem icon={<AppWindow />} text={t('stat4')} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t-2 border-black bg-white px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-12">
            <div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4">{t('appName')}</h2>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest italic max-w-xs">{t('campusFocused')}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs font-black uppercase italic tracking-tighter">
              <Link href="/pitch" className="hover:text-accent underline underline-offset-4">FOR THE UNIVERSITY</Link>
              <Link href="#" className="hover:text-accent underline underline-offset-4">{t('impressum')}</Link>
              <Link href="#" className="hover:text-accent underline underline-offset-4">{t('privacy')}</Link>
              <Link href="#" className="hover:text-accent underline underline-offset-4">{t('tos')}</Link>
            </div>
          </div>
          <div className="pt-8 border-t-2 border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-[10px] font-black uppercase text-muted-foreground italic">{t('madeWithLove')}</p>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
               <MapPin className="h-3 w-3" /> TRIER, GERMANY
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingCard({ icon, title, desc, bgColor }: any) {
  return (
    <div className={cn("neo-card p-8 flex flex-col items-center text-center space-y-4", bgColor)}>
      <div className="p-4 bg-white border-2 border-black mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase italic">{title}</h3>
      <p className="font-bold text-sm leading-tight text-muted-foreground">{desc}</p>
    </div>
  );
}

function SpotCard({ icon, title, desc, color }: any) {
  return (
    <div className={cn("neo-card p-6 space-y-4 group transition-transform hover:-translate-y-2", color)}>
      <div className="p-2 bg-white border-2 border-black w-fit group-hover:bg-black group-hover:text-white transition-colors">
        {icon}
      </div>
      <h4 className="font-black uppercase italic text-sm leading-none">{title}</h4>
      <p className="text-[10px] font-bold leading-tight uppercase opacity-60">{desc}</p>
    </div>
  )
}

function StatItem({ icon, text }: any) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="p-4 bg-zinc-800 border-2 border-zinc-700 text-primary">
        {icon}
      </div>
      <p className="font-black uppercase italic text-sm tracking-tight">{text}</p>
    </div>
  )
}

