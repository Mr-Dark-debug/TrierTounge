
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Compass, LayoutDashboard, MessageSquare, User, TrendingUp, Menu, ChevronLeft } from 'lucide-react';
import { DiscoveryTab } from '@/components/dashboard/discovery-tab';
import { MatchesTab } from '@/components/dashboard/matches-tab';
import { ChatTab } from '@/components/dashboard/chat-tab';
import { ProfileTab } from '@/components/dashboard/profile-tab';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

interface DashboardViewProps {
  profile: any;
  onLogout: () => void;
}

export function DashboardView({ profile, onLogout }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState('discovery');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveTab('chat');
  };

  const copyProfileCode = () => {
    navigator.clipboard.writeText(profile.profileCode);
    toast({
      title: "Copied successfully!",
      description: "Profile code copied to clipboard."
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className={cn("hidden md:flex flex-col p-6 bg-white shrink-0 sticky top-0 h-screen overflow-y-auto border-r-2 border-black transition-all duration-300", isSidebarOpen ? "w-72" : "w-24 px-4 items-center")}>
        <div className={cn("flex items-center mb-12", isSidebarOpen ? "justify-between" : "justify-center mt-2")}>
          {isSidebarOpen && <h1 className="text-3xl font-black italic tracking-tighter uppercase">{t('appName')}</h1>}
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="neo-button bg-white h-8 w-8 p-0 shrink-0">
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="flex-1 space-y-4 w-full">
          <NavButton 
            icon={<Compass className="h-5 w-5 shrink-0" />} 
            label={isSidebarOpen ? t('discovery') : ''} 
            active={activeTab === 'discovery'} 
            onClick={() => {
              setActiveTab('discovery');
              setSelectedChatId(null);
            }} 
            isSidebarOpen={isSidebarOpen}
            titleText={t('discovery')}
          />
          <NavButton 
            icon={<LayoutDashboard className="h-5 w-5 shrink-0" />} 
            label={isSidebarOpen ? t('matches') : ''} 
            active={activeTab === 'matches'} 
            onClick={() => {
              setActiveTab('matches');
              setSelectedChatId(null);
            }} 
            isSidebarOpen={isSidebarOpen}
            titleText={t('matches')}
          />
          <NavButton 
            icon={<MessageSquare className="h-5 w-5 shrink-0" />} 
            label={isSidebarOpen ? t('chat') : ''} 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
            isSidebarOpen={isSidebarOpen}
            titleText={t('chat')}
          />
          <NavButton 
            icon={<User className="h-5 w-5 shrink-0" />} 
            label={isSidebarOpen ? t('profile') : ''} 
            active={activeTab === 'profile'} 
            onClick={() => {
              setActiveTab('profile');
              setSelectedChatId(null);
            }} 
            isSidebarOpen={isSidebarOpen}
            titleText={t('profile')}
          />
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-black space-y-4 w-full flex flex-col items-center">
          {isSidebarOpen ? (
            <button onClick={copyProfileCode} className="w-full text-left p-3 bg-accent/10 border-2 border-black border-dashed hover:bg-accent/20 transition-colors cursor-pointer group relative">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-black uppercase">{t('profileCode')}</span>
              </div>
              <div className="text-lg font-black tracking-widest font-code">{profile.profileCode}</div>
              <div className="absolute inset-0 bg-primary/90 hidden group-hover:flex items-center justify-center font-black text-xs uppercase text-center border-2 border-black">Click to copy</div>
            </button>
          ) : (
            <button onClick={copyProfileCode} className="p-3 bg-accent/10 border-2 border-black border-dashed hover:bg-accent/20 transition-colors w-full flex justify-center items-center cursor-pointer group relative" title="Copy Profile Code">
              <TrendingUp className="h-5 w-5 shrink-0" />
              <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 bg-black text-white px-2 py-1 text-xs whitespace-nowrap hidden group-hover:block z-50 font-bold uppercase pointer-events-none">Copy Code</div>
            </button>
          )}
          <Button onClick={onLogout} variant="outline" className={cn("neo-button bg-white text-xs", isSidebarOpen ? "w-full py-2" : "p-2 w-full h-12 flex justify-center items-center")} title={isSidebarOpen ? '' : t('logout')}>
            <LogOut className={cn("h-4 w-4 shrink-0", isSidebarOpen && "mr-2")} /> {isSidebarOpen && t('logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-0 relative">
        <div className="hidden md:block absolute top-4 right-4 z-50">
           <LanguageSwitcher />
        </div>
        
        {/* Header - Mobile Only */}
        <div className="md:hidden p-4 border-b-2 border-black bg-white flex items-center justify-between sticky top-0 z-40">
           <h1 className="text-2xl font-black italic tracking-tighter uppercase">{t('appName')}</h1>
           <LanguageSwitcher />
        </div>
        <div className="p-4 md:p-10 max-w-7xl mx-auto md:mt-8">
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

function NavButton({ icon, label, active, onClick, isSidebarOpen = true, titleText }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center p-4 font-bold border-2 border-black transition-all uppercase tracking-tighter italic group relative",
        active ? "bg-primary shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white shadow-neo-sm hover:translate-y-[-1px]",
        isSidebarOpen ? "w-full gap-3" : "justify-center w-full aspect-square"
      )}
      title={!isSidebarOpen ? titleText : undefined}
    >
      {icon} {isSidebarOpen && label}
      {!isSidebarOpen && (
        <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 bg-black text-white px-2 py-1 text-xs whitespace-nowrap hidden group-hover:block z-50 font-bold pointer-events-none">
          {titleText}
        </div>
      )}
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
