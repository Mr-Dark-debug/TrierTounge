
"use client"

import { useState, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ArrowLeft, Save, Shield, User, Bell, MessageSquare } from 'lucide-react';
import Link from 'next/link';

import Loader from '@/components/ui/loader';

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
        academicGoals: profile.academicGoals || '',
        socialGoals: profile.socialGoals || '',
        instagram: profile.instagram || '',
        telegram: profile.telegram || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!db || !user || !formData) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
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
      <nav className="max-w-4xl mx-auto flex items-center justify-between mb-12">
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

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
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

        <section className="md:col-span-2 space-y-8">
          <div className="neo-card bg-white p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs">Academic Goals</Label>
                <Textarea 
                  value={formData.academicGoals}
                  onChange={(e) => setFormData({...formData, academicGoals: e.target.value})}
                  className="neo-input min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs">Social Goals</Label>
                <Textarea 
                  value={formData.socialGoals}
                  onChange={(e) => setFormData({...formData, socialGoals: e.target.value})}
                  className="neo-input min-h-[120px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t-2 border-black">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs">Instagram</Label>
                <Input 
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  className="neo-input"
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs">Telegram</Label>
                <Input 
                  value={formData.telegram}
                  onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                  className="neo-input"
                  placeholder="@handle"
                />
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
