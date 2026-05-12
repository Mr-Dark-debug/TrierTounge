
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Compass, LayoutDashboard, MessageSquare, User, TrendingUp } from 'lucide-react';
import { DiscoveryTab } from '@/components/dashboard/discovery-tab';
import { MatchesTab } from '@/components/dashboard/matches-tab';
import { ChatTab } from '@/components/dashboard/chat-tab';
import { ProfileTab } from '@/components/dashboard/profile-tab';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

interface DashboardViewProps {
  profile: any;
  onLogout: () => void;
}

export function DashboardView({ profile, onLogout }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState('discovery');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 border-r-2 border-black flex-col p-6 bg-white shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">{t('appName')}</h1>
          <LanguageSwitcher />
        </div>
        
        <nav className="flex-1 space-y-4">
          <NavButton 
            icon={<Compass className="h-5 w-5" />} 
            label={t('discovery')} 
            active={activeTab === 'discovery'} 
            onClick={() => {
              setActiveTab('discovery');
              setSelectedChatId(null);
            }} 
          />
          <NavButton 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label={t('matches')} 
            active={activeTab === 'matches'} 
            onClick={() => {
              setActiveTab('matches');
              setSelectedChatId(null);
            }} 
          />
          <NavButton 
            icon={<MessageSquare className="h-5 w-5" />} 
            label={t('chat')} 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
          />
          <NavButton 
            icon={<User className="h-5 w-5" />} 
            label={t('profile')} 
            active={activeTab === 'profile'} 
            onClick={() => {
              setActiveTab('profile');
              setSelectedChatId(null);
            }} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-black space-y-4">
          <div className="p-3 bg-accent/10 border-2 border-black border-dashed">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase">{t('profileCode')}</span>
            </div>
            <div className="text-lg font-black tracking-widest font-code">{profile.profileCode}</div>
          </div>
          <Button onClick={onLogout} variant="outline" className="w-full neo-button bg-white text-xs py-2">
            <LogOut className="mr-2 h-4 w-4" /> {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">
        {/* Header - Mobile Only */}
        <div className="md:hidden p-4 border-b-2 border-black bg-white flex items-center justify-between sticky top-0 z-40">
           <h1 className="text-2xl font-black italic tracking-tighter uppercase">{t('appName')}</h1>
           <LanguageSwitcher />
        </div>
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {activeTab === 'discovery' && <DiscoveryTab profile={profile} />}
          {activeTab === 'matches' && <MatchesTab profile={profile} onChatOpen={handleOpenChat} />}
          {activeTab === 'chat' && <ChatTab profile={profile} initialChatId={selectedChatId} />}
          {activeTab === 'profile' && <ProfileTab profile={profile} />}
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black flex justify-around p-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <MobileNavButton 
          icon={<Compass />} 
          active={activeTab === 'discovery'} 
          onClick={() => {
            setActiveTab('discovery');
            setSelectedChatId(null);
          }} 
        />
        <MobileNavButton 
          icon={<LayoutDashboard />} 
          active={activeTab === 'matches'} 
          onClick={() => {
            setActiveTab('matches');
            setSelectedChatId(null);
          }} 
        />
        <MobileNavButton 
          icon={<MessageSquare />} 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')} 
        />
        <MobileNavButton 
          icon={<User />} 
          active={activeTab === 'profile'} 
          onClick={() => {
            setActiveTab('profile');
            setSelectedChatId(null);
          }} 
        />
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
    <button 
      onClick={onClick} 
      className={cn(
        "p-4 transition-all flex items-center justify-center flex-1", 
        active && "bg-primary border-2 border-black mx-1"
      )}
    >
      {icon}
    </button>
  );
}
