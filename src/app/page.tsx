
"use client"

import { useState, useEffect, useMemo } from 'react';
import { AuthView } from '@/components/auth/auth-view';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { ProfileBuilder } from '@/components/onboarding/profile-builder';
import { EmailVerification } from '@/components/auth/email-verification';
import { LandingPage } from '@/components/landing/landing-page';
import { useUser, useDoc, useFirestore, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Loader from '@/components/ui/loader';

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [justVerified, setJustVerified] = useState(false);
  const db = useFirestore();
  const auth = useAuth();
  
  const profileRef = useMemo(() => {
    return user && db ? doc(db, 'users', user.uid) : null;
  }, [user, db]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setShowAuth(false);
      setJustVerified(false);
    }
  };

  const handleProfileComplete = (updatedData: any) => {
    if (!db || !user) return;
    
    const profileCode = profile?.profileCode || `#${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const fullProfile = {
      ...updatedData,
      uid: user.uid,
      email: user.email,
      profileCode,
      isVerified: true,
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'users', user.uid), fullProfile, { merge: true });
  };

  const handleVerified = () => {
    setJustVerified(true);
  };

  if (authLoading || (user && profileLoading)) {
    return <Loader />;
  }

  // Not logged in
  if (!user) {
    if (showAuth) {
      return <AuthView onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // Logged in but email NOT verified
  if (!profile?.isVerified && !justVerified) {
    return <EmailVerification user={user} onVerified={handleVerified} onLogout={handleLogout} />;
  }

  // Logged in, verified, but profile incomplete
  if (!profile || !profile.onboardingCompleted) {
    return <ProfileBuilder user={user} onComplete={handleProfileComplete} onLogout={handleLogout} />;
  }

  // Logged in, verified, and complete
  return <DashboardView profile={profile} onLogout={handleLogout} />;
}

