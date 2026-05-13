
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Languages, GraduationCap, MapPin, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';

export function AuthView({ onBack }: { onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    // Enforce @uni-trier.de email domain
    if (!email.toLowerCase().endsWith('@uni-trier.de')) {
      toast({
        variant: "destructive",
        title: "Invalid Email Domain",
        description: "Only @uni-trier.de university email addresses are allowed. Please use your university email."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      let friendlyMessage = error.message;
      const code = error.code || '';
      
      if (code === 'auth/configuration-not-found') {
        friendlyMessage = 'Email/Password sign-in is not enabled in the Firebase Console. Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password.';
      } else if (code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email is already registered. Try logging in instead.';
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password. Please check your credentials.';
      } else if (code === 'auth/too-many-requests') {
        friendlyMessage = 'Too many failed attempts. Please try again later.';
      } else if (code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        friendlyMessage = 'Firebase API key is invalid. Please check your .env configuration.';
      }

      toast({
        variant: "destructive",
        title: "Auth Error",
        description: friendlyMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-x-hidden">
      {/* Absolute Header Controls */}
      <div className="absolute top-4 left-4 z-50">
        <Button onClick={onBack} variant="ghost" className="neo-button bg-white p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <Link href="/feedback">
          <Button variant="ghost" size="sm" className="font-bold text-xs uppercase italic border-2 border-transparent hover:border-black gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </Button>
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="md:w-1/2 p-6 md:p-16 flex flex-col justify-center border-b-2 md:border-b-0 md:border-r-2 border-black bg-primary/5">
        <div className="mb-8 md:mb-12">
          <div className="inline-block bg-accent px-3 py-0.5 md:px-4 md:py-1 border-2 border-black mb-4 font-bold uppercase tracking-widest text-[10px] md:text-sm">
            {t('exclusive')}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.85] mb-6 tracking-tighter italic">
            TRIER<br/>TONGUE.
          </h1>
          <p className="text-lg md:text-2xl font-bold max-w-md leading-tight">
            {t('tagline')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 max-w-md">
          <div className="neo-card p-4 md:p-6 bg-primary flex gap-4 items-start">
            <Languages className="shrink-0 h-6 w-6 md:h-8 md:w-8" />
            <div>
              <h3 className="font-bold text-base md:text-lg text-black leading-none mb-1 uppercase tracking-tight italic">{t('reciprocalMatching')}</h3>
              <p className="text-xs md:text-sm text-black/80 font-medium">{t('reciprocalMatchingDesc')}</p>
            </div>
          </div>
          <div className="neo-card p-4 md:p-6 bg-white flex gap-4 items-start">
            <GraduationCap className="shrink-0 h-6 w-6 md:h-8 md:w-8" />
            <div>
              <h3 className="font-bold text-base md:text-lg leading-none mb-1 uppercase tracking-tight italic">{t('campusFocused')}</h3>
              <p className="text-xs md:text-sm font-medium">{t('campusFocusedDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 p-6 md:p-16 flex items-center justify-center bg-[#fdfdfd]">
        <div className="w-full max-w-md neo-card p-6 md:p-10 bg-white">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-2 uppercase italic leading-none">
              {isLogin ? t('welcomeBack') : t('joinTribe')}
            </h2>
            <p className="font-bold text-xs md:text-sm text-muted-foreground italic tracking-tight uppercase">
              {t('accessEmail')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold uppercase tracking-wider text-[10px]">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Max Mustermann" 
                  required 
                  className="neo-input h-12" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold uppercase tracking-wider text-[10px]">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="s4mumu00@uni-trier.de" 
                required 
                className="neo-input h-12" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass" className="font-bold uppercase tracking-wider text-[10px]">Password</Label>
              <Input 
                id="pass" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="neo-input h-12" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full neo-button text-base md:text-lg py-6 md:py-8 group">
              {loading ? t('processing') : (isLogin ? t('login') : t('signup'))} 
              {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t-2 border-black flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-black text-xs md:text-sm underline underline-offset-4 hover:text-accent transition-colors uppercase italic"
            >
              {isLogin ? t('noAccount') : t('hasAccount')}
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
              <MapPin className="h-3 w-3" /> TRIER, GERMANY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
