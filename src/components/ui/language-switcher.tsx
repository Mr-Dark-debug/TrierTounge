
'use client';

import { useLanguage } from '@/context/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="neo-button bg-white flex items-center gap-2 px-3 h-10">
          <span className="text-lg">{currentLang?.flag}</span>
          <span className="font-bold hidden sm:inline">{currentLang?.code.toUpperCase()}</span>
          <Globe className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="neo-card bg-white p-1 min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className="flex items-center gap-3 p-2 font-bold hover:bg-primary cursor-pointer transition-colors"
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="uppercase text-xs tracking-widest">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
