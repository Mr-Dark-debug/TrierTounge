
"use client"

import { Button } from '@/components/ui/button';
import { GraduationCap, Languages, Sparkles, MapPin, Instagram, Send, Edit, ShieldCheck, Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseApp } from '@/firebase/config';
import teacherImg from '@/assets/teacher-img.jpg';
import studentImg from '@/assets/student-img.jpg';

export function ProfileTab({ profile }: { profile: any }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Get Base64 string directly from canvas
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64String);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 10MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const base64Image = await compressImageToBase64(file);
      
      const db = getFirestore(getFirebaseApp());
      await updateDoc(doc(db, 'users', profile.uid), {
        photoURL: base64Image
      });
      
      toast({ title: 'Success', description: 'Profile picture updated!' });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: 'Error', description: 'Could not process image.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const displayYear = ['1', '2', '3', '4'].includes(String(profile.year)) ? `Year ${profile.year}` : profile.year;
  const contactEntries = [
    { label: 'Instagram', value: profile.instagram },
    { label: 'Telegram', value: profile.telegram },
    { label: 'WhatsApp', value: profile.whatsapp },
    { label: 'Discord', value: profile.discord },
    { label: 'Signal', value: profile.signal },
    { label: profile.otherContactLabel || 'Other', value: profile.otherContactHandle },
  ].filter(entry => entry.value);

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
                className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 cursor-pointer'}`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-white border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <span className="text-white font-bold text-xs uppercase tracking-widest bg-black px-3 py-1 border-2 border-white">
                    Upload Photo
                  </span>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <div>
              <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">{profile.name}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{profile.major}</p>
              <p className="text-[10px] font-black text-primary uppercase">{displayYear}</p>
              {profile.faculty && <p className="text-[10px] font-bold uppercase tracking-wider mt-2">{profile.faculty}</p>}
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
                <p className="text-sm font-bold text-black/80">
                  {contactEntries.length > 0
                    ? `Saved contact methods: ${contactEntries.map(entry => `${entry.label}: ${entry.value}`).join(' • ')}`
                    : 'No contact handles saved yet.'}
                </p>
                <p className="text-xs font-bold uppercase mt-2 text-black/70">
                  {profile.showContactOnMatch ? 'Configured to reveal handles after mutual match acceptance.' : 'Configured to keep handles visible on profile.'}
                </p>
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
