
"use client"

import { useState, useEffect } from 'react';
import { AuthView } from '@/components/auth/auth-view';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { ProfileBuilder } from '@/components/onboarding/profile-builder';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check local storage for session (Mock Auth)
    const storedUser = localStorage.getItem('trier_tongue_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setHasCompletedProfile(user.onboardingCompleted || false);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (user: any) => {
    localStorage.setItem('trier_tongue_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    setHasCompletedProfile(user.onboardingCompleted || false);
  };

  const handleLogout = () => {
    localStorage.removeItem('trier_tongue_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setHasCompletedProfile(false);
  };

  const handleProfileComplete = (updatedUser: any) => {
    const fullUser = { ...currentUser, ...updatedUser, onboardingCompleted: true };
    localStorage.setItem('trier_tongue_user', JSON.stringify(fullUser));
    setCurrentUser(fullUser);
    setHasCompletedProfile(true);
  };

  if (isAuthenticated === null) return null; // Hydration loading

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  if (!hasCompletedProfile) {
    return <ProfileBuilder user={currentUser} onComplete={handleProfileComplete} onLogout={handleLogout} />;
  }

  return <DashboardView user={currentUser} onLogout={handleLogout} />;
}
