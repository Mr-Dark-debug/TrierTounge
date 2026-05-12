
"use client"

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Database, ShieldCheck, UserCheck, ArrowLeft, Globe, Zap, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PitchPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fdfdfd] selection:bg-accent selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 bg-white/80 backdrop-blur-md border-b-2 border-black flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="neo-button bg-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">{t('appName')} <span className="text-accent">X</span> UNI TRIER</h1>
        </div>
        <LanguageSwitcher />
      </nav>

      {/* Pitch Content */}
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="mb-16 md:mb-24 text-center">
          <div className="inline-block bg-primary px-6 py-2 border-2 border-black mb-8 font-black uppercase tracking-[0.2em] text-sm italic">
            Administration Proposal
          </div>
          <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] mb-8">
            {t('pitchTitle')}
          </h2>
          <p className="text-xl md:text-3xl font-bold uppercase italic max-w-3xl mx-auto leading-tight">
            {t('pitchSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <PitchPoint 
              icon={<Zap className="h-8 w-8 text-primary" />}
              title={t('pitchPoint1')}
              desc={t('pitchPoint1Desc')}
            />
            <PitchPoint 
              icon={<ShieldCheck className="h-8 w-8 text-accent" />}
              title={t('pitchPoint2')}
              desc={t('pitchPoint2Desc')}
            />
            <PitchPoint 
              icon={<Database className="h-8 w-8 text-black" />}
              title={t('pitchPoint3')}
              desc={t('pitchPoint3Desc')}
            />
          </div>
          <div className="neo-card bg-white p-8 border-dashed flex flex-col justify-center items-center text-center space-y-8">
            <div className="relative w-48 h-48 border-4 border-black overflow-hidden grayscale">
               <Image src="https://picsum.photos/seed/trier-admin/400/400" alt="Administration" fill className="object-cover" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tight">Request a Demo for Studierendenwerk or HR</h3>
              <p className="font-bold text-muted-foreground uppercase text-sm italic tracking-widest">Bridging the gap between domestic and international students at University of Trier.</p>
              <Button className="neo-button bg-primary w-full py-8 text-xl group">
                {t('contactUni')} <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Integration Details */}
        <div className="neo-card bg-black text-white p-10 space-y-8">
          <h3 className="text-4xl font-black italic uppercase text-primary">Technical Specs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 border-l-2 border-white/20 pl-6">
              <h4 className="font-black uppercase tracking-widest text-primary text-xs">Auth Protocol</h4>
              <p className="text-2xl font-black italic uppercase">OIDC / SAML 2.0</p>
            </div>
            <div className="space-y-2 border-l-2 border-white/20 pl-6">
              <h4 className="font-black uppercase tracking-widest text-primary text-xs">Data Sync</h4>
              <p className="text-2xl font-black italic uppercase">REST API / Webhooks</p>
            </div>
            <div className="space-y-2 border-l-2 border-white/20 pl-6">
              <h4 className="font-black uppercase tracking-widest text-primary text-xs">Security</h4>
              <p className="text-2xl font-black italic uppercase">AES-256 Encryption</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PitchPoint({ icon, title, desc }: any) {
  return (
    <div className="neo-card bg-white p-8 flex gap-6 items-start transition-transform hover:translate-x-2">
      <div className="shrink-0 p-4 border-2 border-black bg-white shadow-neo-sm">
        {icon}
      </div>
      <div className="space-y-2">
        <h4 className="text-2xl font-black uppercase italic tracking-tight leading-none">{title}</h4>
        <p className="font-bold text-muted-foreground leading-tight">{desc}</p>
      </div>
    </div>
  );
}
