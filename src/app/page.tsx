
"use client"

import { useState, useEffect } from 'react';
import { AuthView } from '@/components/auth/auth-view';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { ProfileBuilder } from '@/components/onboarding/profile-builder';
import { useUser, useDoc, useFirestore, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  
  const { data: profile, loading: profileLoading } = useDoc(
    user && db ? doc(db, 'users', user.uid) : null
  );

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  const handleProfileComplete = (updatedData: any) => {
    if (!db || !user) return;
    
    // Generate a unique profile code if not exists
    const profileCode = profile?.profileCode || `#${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const fullProfile = {
      ...updatedData,
      uid: user.uid,
      email: user.email,
      profileCode,
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'users', user.uid), fullProfile, { merge: true });
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl font-black animate-pulse uppercase italic">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  if (!profile || !profile.onboardingCompleted) {
    return <ProfileBuilder user={user} onComplete={handleProfileComplete} onLogout={handleLogout} />;
  }

  return <DashboardView profile={profile} onLogout={handleLogout} />;
}
