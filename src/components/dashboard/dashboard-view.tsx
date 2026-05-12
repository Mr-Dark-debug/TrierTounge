
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Compass, LayoutDashboard, MessageSquare, User, TrendingUp } from 'lucide-react';
import { DiscoveryTab } from '@/components/dashboard/discovery-tab';
import { MatchesTab } from '@/components/dashboard/matches-tab';
import { ChatTab } from '@/components/dashboard/chat-tab';
import { ProfileTab } from '@/components/dashboard/profile-tab';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  profile: any;
  onLogout: () => void;
}

export function DashboardView({ profile, onLogout }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState('discovery');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 border-r-2 border-black flex-col p-6 bg-white shrink-0">
        <h1 className="text-3xl font-black italic mb-12 tracking-tighter">TRIERTONGUE</h1>
        
        <nav className="flex-1 space-y-4">
          <NavButton 
            icon={<Compass className="h-5 w-5" />} 
            label="DISCOVERY" 
            active={activeTab === 'discovery'} 
            onClick={() => setActiveTab('discovery')} 
          />
          <NavButton 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="MY MATCHES" 
            active={activeTab === 'matches'} 
            onClick={() => setActiveTab('matches')} 
          />
          <NavButton 
            icon={<MessageSquare className="h-5 w-5" />} 
            label="CHAT" 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
          />
          <NavButton 
            icon={<User className="h-5 w-5" />} 
            label="PROFILE" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-black space-y-4">
          <div className="p-3 bg-accent/10 border-2 border-black border-dashed">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase">YOUR CODE</span>
            </div>
            <div className="text-lg font-black tracking-widest font-code">{profile.profileCode}</div>
          </div>
          <Button onClick={onLogout} variant="outline" className="w-full neo-button bg-white text-xs py-2">
            <LogOut className="mr-2 h-4 w-4" /> LOGOUT
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {activeTab === 'discovery' && <DiscoveryTab profile={profile} />}
          {activeTab === 'matches' && <MatchesTab profile={profile} onChatOpen={handleOpenChat} />}
          {activeTab === 'chat' && <ChatTab profile={profile} initialChatId={selectedChatId} />}
          {activeTab === 'profile' && <ProfileTab profile={profile} />}
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black flex justify-around p-2 z-50">
        <MobileNavButton icon={<Compass />} active={activeTab === 'discovery'} onClick={() => setActiveTab('discovery')} />
        <MobileNavButton icon={<LayoutDashboard />} active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />
        <MobileNavButton icon={<MessageSquare />} active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <MobileNavButton icon={<User />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 font-bold border-2 border-black transition-all uppercase tracking-tighter italic",
        active ? "bg-primary shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white shadow-neo-sm hover:translate-y-[-1px]"
      )}
    >
      {icon} {label}
    </button>
  );
}

function MobileNavButton({ icon, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("p-4 transition-all", active && "bg-primary border-2 border-black")}>
      {icon}
    </button>
  );
}
