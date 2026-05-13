
"use client"

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { 
  Languages, GraduationCap, MapPin, Sparkles, ArrowRight, UserCheck, 
  LocateFixed, HeartHandshake, Coffee, Library, 
  TreePine, Building, Home, Users, BookOpen, AppWindow, MessageCircle, Github, Code, ExternalLink, ShieldCheck, Globe
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import bgImage from '@/assets/bg 2.jpg';
import step1Img from '@/assets/ill 3.jpg';
import step2Img from '@/assets/ill2.jpg';
import step3Img from '@/assets/ill3.jpg';
import teacherImg from '@/assets/teacher-img.jpg';
import studentImg from '@/assets/student-img.jpg';
import asyncImg from '@/assets/async-img.jpg';
import openSourceImg from '@/assets/opensource-img.jpg';
import visionImg from '@/assets/vision-img.jpg';

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
          <Link href="/feedback">
            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase italic border-2 border-transparent hover:border-black gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>
          </Link>
          <LanguageSwitcher />
          <Button onClick={onGetStarted} className="neo-button bg-primary text-xs md:text-sm">
            {t('login')}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] pt-32 pb-16 md:pt-48 md:pb-32 px-4 md:px-8 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={bgImage} 
            alt="Hero Background" 
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="inline-block bg-accent px-4 py-1 border-2 border-black mb-6 md:mb-8 font-black uppercase tracking-widest text-xs md:text-sm rotate-2">
            {t('exclusive')}
          </div>
          <h2 
            className="text-[clamp(3.5rem,8vw,8.5rem)] font-black leading-[0.85] mb-8 md:mb-14 tracking-tighter italic text-white break-words"
            style={{
              WebkitTextStroke: '2px black',
              textShadow: '4px 4px 0px black, 6px 6px 0px rgba(0,0,0,0.2)'
            }}
          >
            {t('heroTitle')}<br/>
            <span className="text-accent underline decoration-black md:decoration-8 underline-offset-4 md:underline-offset-8">{t('heroHighlight')}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none mx-auto">
            <Button onClick={onGetStarted} className="w-full sm:w-auto neo-button text-base sm:text-lg md:text-2xl py-6 sm:py-8 md:py-10 px-8 sm:px-10 group bg-primary">
              {t('getStarted')} <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/pitch" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full neo-button-pink text-base sm:text-lg md:text-2xl py-6 sm:py-8 md:py-10 px-8 sm:px-10">
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
              icon={<Image src={step1Img} alt="Step 1" width={160} height={160} className="w-40 h-40 object-cover" />} 
              title={t('step1Title')} 
              desc={t('step1Desc')} 
              bgColor="bg-primary/20"
            />
            <LandingCard 
              icon={<Image src={step2Img} alt="Step 2" width={160} height={160} className="w-40 h-40 object-cover" />} 
              title={t('step2Title')} 
              desc={t('step2Desc')} 
              bgColor="bg-accent/20"
            />
            <LandingCard 
              icon={<Image src={step3Img} alt="Step 3" width={160} height={160} className="w-40 h-40 object-cover" />} 
              title={t('step3Title')} 
              desc={t('step3Desc')} 
              bgColor="bg-white"
            />
          </div>
        </div>
      </section>

      {/* Trust & Exclusivity Section */}
      <section className="py-24 px-4 md:px-8 bg-black text-primary border-y-[4px] border-black overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20">
            <div className="space-y-6">
              <p className="text-xs font-black uppercase tracking-[0.4em] bg-primary text-black px-3 py-1 w-fit rotate-[-1deg]">
                02 — SECURITY PROTOCOL
              </p>
              <h2 className="text-6xl md:text-[10rem] font-black leading-[0.75] uppercase tracking-tighter italic text-primary">
                SAFE.<br />
                EXCLUSIVE.<br />
                <span className="text-accent">TRIER</span>-ONLY.
              </h2>
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
              <div className="flex items-center gap-6 mb-8">
                <div className="relative h-24 w-24 bg-white border-2 border-black shadow-neo-sm shrink-0 overflow-hidden">
                  <Image src={teacherImg} alt="Teacher" fill className="object-cover" />
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
              <div className="flex items-center gap-6 mb-8">
                <div className="relative h-24 w-24 bg-white border-2 border-black shadow-neo-sm shrink-0 overflow-hidden">
                  <Image src={studentImg} alt="Student" fill className="object-cover" />
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
           <div className="neo-card bg-white p-0 rotate-[-2deg] shrink-0 border-4 overflow-hidden h-40 w-40 relative">
             <Image src={asyncImg} alt="Async Exchange" fill className="object-cover" />
           </div>
           <div className="space-y-6">
             <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-none">{t('asyncTitle')}</h2>
             <p className="text-xl md:text-2xl font-bold italic max-w-2xl">{t('asyncDesc')}</p>
           </div>
        </div>
      </section>

      {/* Open Source & Community Driven Section */}
      <section className="py-24 px-4 md:px-8 bg-black text-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent mb-4">05 — COMMUNITY BUILT</p>
            <h2 className="text-5xl md:text-8xl font-black leading-[0.85] uppercase tracking-tighter italic text-accent">
              {t('openSourceTitle').split(' ').slice(0, 2).join(' ')}<br />
              {t('openSourceTitle').split(' ').slice(2).join(' ')}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase italic flex items-center gap-3">
                  <Code className="h-8 w-8 text-primary" /> {t('openSourceSubtitle')}
                </h3>
                <p className="text-xl font-bold leading-tight text-zinc-400">
                  {t('openSourceDesc')}
                </p>
                <Link href="https://github.com/Mr-Dark-debug/TrierTongue" target="_blank">
                  <Button className="neo-button bg-primary text-black mt-6 px-8 py-8 text-xl h-auto">
                    {t('viewRepo')} <Github className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-2 border-zinc-800">
                <div className="space-y-2">
                  <h4 className="font-black uppercase italic text-primary">{t('builtByTitle')}</h4>
                  <p className="text-sm font-bold text-zinc-500">{t('builtByDesc')}</p>
                  <Link href="https://github.com/Mr-Dark-debug" target="_blank" className="inline-flex items-center text-xs font-black uppercase text-accent hover:underline gap-1 mt-2">
                    @Mr-Dark-debug <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black uppercase italic text-accent">{t('contributeTitle')}</h4>
                  <p className="text-sm font-bold text-zinc-500">{t('contributeDesc')}</p>
                  <Link href="https://github.com/Mr-Dark-debug/TrierTongue" target="_blank" className="inline-flex items-center text-xs font-black uppercase text-primary hover:underline gap-1 mt-2">
                    {t('startContributing')} <Github className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative h-[500px] neo-card bg-zinc-900 border-accent overflow-hidden">
               <Image src={openSourceImg} alt="Open Source Community" fill className="object-cover opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
               <div className="absolute bottom-8 left-8">
                  <div className="text-left rotate-[-5deg]">
                    <Github className="h-24 w-24 text-accent mb-4" />
                    <span className="font-code font-black text-4xl text-primary block">git push</span>
                    <span className="font-code font-bold text-xl text-white">origin main</span>
                  </div>
               </div>
            </div>
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
                    <div className="relative w-32 h-32 md:w-48 md:h-48 border-2 border-black overflow-hidden bg-white">
                      <Image 
                        src={visionImg} 
                        alt="Our Vision" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Block - Revamped */}
      <section className="py-24 px-4 md:px-8 bg-black text-white border-b-2 border-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-16 text-center">06 — OUR SCALE</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
             <StatItem icon={<Users />} number="1,000+" text={t('stat1')} />
             <StatItem icon={<BookOpen />} number="6" text={t('stat2')} />
             <StatItem icon={<Sparkles />} number="0" text={t('stat3')} />
             <StatItem icon={<AppWindow />} number="1" text={t('stat4')} />
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
      <div className="bg-white border-2 border-black mb-4 flex items-center justify-center overflow-hidden">
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

function StatItem({ icon, number, text }: { icon: React.ReactNode, number: string, text: string }) {
  return (
    <div className="bg-black p-12 md:p-16 flex flex-col items-center text-center group transition-all duration-300 hover:bg-primary hover:text-black cursor-default border-primary/10 first:border-l-0 border-l border-y md:border-y-0">
      <div className="text-primary mb-8 transition-transform group-hover:scale-125 group-hover:text-black">
        {icon}
      </div>
      <div className="text-[clamp(4rem,10vw,8rem)] font-black italic tracking-tighter uppercase leading-none mb-6 text-primary group-hover:text-black transition-colors">
        {number}
      </div>
      <p className="font-black uppercase italic text-sm md:text-base tracking-[0.2em] text-zinc-400 group-hover:text-black transition-colors leading-tight">
        {text}
      </p>
    </div>
  )
}
