
"use client"

import { Button } from '@/components/ui/button';
import { GraduationCap, Languages, Sparkles, MapPin, Instagram, Send, Edit, ShieldCheck, Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseApp } from '@/firebase/config';
import teacherImg from '@/assets/teacher-img.jpg';
import studentImg from '@/assets/student-img.jpg';

export function ProfileTab({ profile }: { profile: any }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const storage = getStorage(getFirebaseApp());
      const storageRef = ref(storage, `profile_pictures/${profile.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const db = getFirestore(getFirebaseApp());
      await updateDoc(doc(db, 'users', profile.uid), {
        photoURL: downloadURL
      });
      
      toast({ title: 'Success', description: 'Profile picture updated!' });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: 'Upload failed', description: 'Make sure Firebase Storage is enabled in your console.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const displayYear = ['1', '2', '3', '4'].includes(String(profile.year)) ? `Year ${profile.year}` : profile.year;

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
            <div className="relative h-48 w-48 mx-auto border-2 border-black bg-muted group overflow-hidden">
              <Image 
                src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/400/400`} 
                alt={profile.name || "Profile Picture"} 
                fill 
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div 
                className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-white font-bold text-xs uppercase tracking-widest bg-black px-3 py-1 border-2 border-white">
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div>
              <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">{profile.name}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{profile.major}</p>
              <p className="text-[10px] font-black text-primary uppercase">{displayYear}</p>
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

          <div className="neo-card bg-primary text-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-black">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-10 w-10 text-black shrink-0" />
              <div>
                <h4 className="font-black italic uppercase text-lg leading-none mb-1 text-black">{t('safetyPrivacy')}</h4>
                <p className="text-sm font-bold text-black/80">Your handles (Instagram: {profile.instagram || 'None'}, Telegram: {profile.telegram || 'None'}) are shared only with mutual matches.</p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="outline" className="w-full md:w-auto border-black text-black hover:bg-black hover:text-white neo-button bg-white">
                {t('settings')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
