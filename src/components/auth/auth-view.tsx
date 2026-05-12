
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Languages, GraduationCap, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // We'll update the profile in onboarding
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center border-b-2 md:border-b-0 md:border-r-2 border-black">
        <div className="mb-12">
          <div className="inline-block bg-accent px-4 py-1 border-2 border-black mb-4 font-bold uppercase tracking-widest text-sm">
            Trier University Exclusive
          </div>
          <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6">
            TRIER<br/>TONGUE.
          </h1>
          <p className="text-xl md:text-2xl font-semibold max-w-md">
            The Neo-brutalist language exchange platform for Uni Trier students. Find your reciprocal match.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="neo-card p-6 bg-primary flex gap-4 items-start">
            <Languages className="shrink-0 h-8 w-8" />
            <div>
              <h3 className="font-bold text-lg text-black">Reciprocal Matching</h3>
              <p className="text-black/80">AI-powered pairing based on what you need and what you can give.</p>
            </div>
          </div>
          <div className="neo-card p-6 bg-white flex gap-4 items-start">
            <GraduationCap className="shrink-0 h-8 w-8" />
            <div>
              <h3 className="font-bold text-lg">Campus Focused</h3>
              <p>Filters for Trier majors, study years, and local meeting spots.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-[#fdfdfd]">
        <div className="w-full max-w-md neo-card p-10 bg-white">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black mb-2 uppercase italic">{isLogin ? 'Welcome Back' : 'Join the Tribe'}</h2>
            <p className="font-medium text-muted-foreground italic tracking-tight">Access with your university email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold uppercase tracking-wider text-xs">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Max Mustermann" 
                  required 
                  className="neo-input" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold uppercase tracking-wider text-xs">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="s4mumu00@uni-trier.de" 
                required 
                className="neo-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass" className="font-bold uppercase tracking-wider text-xs">Password</Label>
              <Input 
                id="pass" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="neo-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full neo-button text-lg py-6 group">
              {loading ? 'PROCESSING...' : (isLogin ? 'LOG IN' : 'CREATE ACCOUNT')} 
              {!loading && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-black flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-sm underline underline-offset-4 hover:text-accent transition-colors uppercase"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
              <MapPin className="h-3 w-3" /> TRIER, GERMANY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
