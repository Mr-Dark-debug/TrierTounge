
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchCard } from '@/components/dashboard/match-card';
import { Search, Filter, LogOut, LayoutDashboard, Compass, MessageSquare, User, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DashboardViewProps {
  user: any;
  onLogout: () => void;
}

export function DashboardView({ user, onLogout }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState('discovery');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock student data
  const mockStudents = [
    {
      id: '2',
      name: 'Lukas Meyer',
      major: 'Business Informatics',
      year: '3',
      nativeLanguage: 'German',
      targetLanguage: 'Spanish',
      academicGoals: 'I need help with my semester project documentation in Spanish for an international business class.',
      socialGoals: 'I love playing table tennis at the university gym and grabbing beers downtown.',
      availability: Array(21).fill(false).map(() => Math.random() > 0.7),
      matchScore: 92,
      isNew: true
    },
    {
      id: '3',
      name: 'Elena Garcia',
      major: 'Psychology',
      year: '1',
      nativeLanguage: 'Spanish',
      targetLanguage: 'German',
      academicGoals: 'Reading psychological papers in German is quite hard for me. Looking for someone to practice reading.',
      socialGoals: 'I love visiting the local museums in Trier and want to practice conversational German while exploring.',
      availability: Array(21).fill(false).map(() => Math.random() > 0.7),
      matchScore: 88,
      isNew: false
    },
    {
      id: '4',
      name: 'Jin Wang',
      major: 'Digital Humanities',
      year: '2',
      nativeLanguage: 'Chinese',
      targetLanguage: 'German',
      academicGoals: 'Studying for my history exams at the city library. Need help with old German scripts.',
      socialGoals: 'I enjoy visiting the weekly market at the Porta Nigra. Let’s go together!',
      availability: Array(21).fill(false).map(() => Math.random() > 0.7),
      matchScore: 75,
      isNew: true
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 border-r-2 border-black flex-col p-6 bg-white shrink-0">
        <h1 className="text-2xl font-black italic mb-12 tracking-tighter">TRIERTONGUE</h1>
        
        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setActiveTab('discovery')}
            className={cn(
              "w-full flex items-center gap-3 p-3 font-bold border-2 border-black transition-all",
              activeTab === 'discovery' ? "bg-primary shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white shadow-neo-sm hover:translate-y-[-1px]"
            )}
          >
            <Compass className="h-5 w-5" /> DISCOVERY
          </button>
          <button 
            onClick={() => setActiveTab('matches')}
            className={cn(
              "w-full flex items-center gap-3 p-3 font-bold border-2 border-black transition-all",
              activeTab === 'matches' ? "bg-primary shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white shadow-neo-sm hover:translate-y-[-1px]"
            )}
          >
            <LayoutDashboard className="h-5 w-5" /> MY MATCHES
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={cn(
              "w-full flex items-center gap-3 p-3 font-bold border-2 border-black transition-all",
              activeTab === 'chat' ? "bg-primary shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white shadow-neo-sm hover:translate-y-[-1px]"
            )}
          >
            <MessageSquare className="h-5 w-5" /> CHAT
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "w-full flex items-center gap-3 p-3 font-bold border-2 border-black transition-all",
              activeTab === 'profile' ? "bg-primary shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white shadow-neo-sm hover:translate-y-[-1px]"
            )}
          >
            <User className="h-5 w-5" /> PROFILE
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-black">
          <div className="flex items-center gap-3 mb-6 p-2 bg-accent/10 border-2 border-black border-dashed">
            <TrendingUp className="h-4 w-4" />
            <div className="text-xs font-bold uppercase">
              Profile: 85% Complete
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" className="w-full neo-button bg-white text-xs py-2">
            <LogOut className="mr-2 h-4 w-4" /> LOGOUT
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase bg-accent px-2 py-0.5 border-2 border-black">Trier University</span>
              <span className="text-xs font-bold text-muted-foreground">Session: {new Date().getFullYear()} / Winter</span>
            </div>
            <h2 className="text-5xl font-black italic tracking-tighter uppercase">
              {activeTab === 'discovery' ? 'Find Your Tongue' : activeTab === 'matches' ? 'Mutual Connections' : 'Student Hub'}
            </h2>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filter by major or language..." 
                className="neo-input pl-10 h-12 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="neo-button h-12 bg-white flex items-center gap-2">
              <Filter className="h-4 w-4" /> <span className="hidden md:inline">FILTERS</span>
            </Button>
          </div>
        </header>

        {/* Discovery Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {mockStudents
            .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.major.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(student => (
              <MatchCard key={student.id} currentUser={user} student={student} />
            ))}
        </div>
      </main>

      {/* Bottom Nav - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black flex justify-around p-2 z-50">
        <button onClick={() => setActiveTab('discovery')} className={cn("p-3", activeTab === 'discovery' && "bg-primary border-2 border-black")}>
          <Compass className="h-6 w-6" />
        </button>
        <button onClick={() => setActiveTab('matches')} className={cn("p-3", activeTab === 'matches' && "bg-primary border-2 border-black")}>
          <LayoutDashboard className="h-6 w-6" />
        </button>
        <button onClick={() => setActiveTab('chat')} className={cn("p-3", activeTab === 'chat' && "bg-primary border-2 border-black")}>
          <MessageSquare className="h-6 w-6" />
        </button>
        <button onClick={() => setActiveTab('profile')} className={cn("p-3", activeTab === 'profile' && "bg-primary border-2 border-black")}>
          <User className="h-6 w-6" />
        </button>
      </nav>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
