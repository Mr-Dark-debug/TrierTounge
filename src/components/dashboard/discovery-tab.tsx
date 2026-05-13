
"use client"

import { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { MatchCard } from '@/components/dashboard/match-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Search, Filter, Sparkles, X } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import noResultsIll from '../../assets/ill13.jpg';

export function DiscoveryTab({ profile }: { profile: any }) {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMajor, setFilterMajor] = useState<string | null>(null);
  const { t } = useLanguage();

  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'users'),
      where('onboardingCompleted', '==', true),
      limit(50)
    );
  }, [db]);

  const { data: students, loading } = useCollection(studentsQuery);

  const majors = useMemo(() => {
    if (!students) return [];
    const uniqueMajors = Array.from(new Set(students.map(s => s.major))).filter(Boolean);
    return uniqueMajors.sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => {
      if (s.uid === profile.uid) return false;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.nativeLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.targetLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (s.profileCode && s.profileCode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMajor = !filterMajor || s.major === filterMajor;
      return matchesSearch && matchesMajor;
    });
  }, [students, searchQuery, filterMajor, profile.uid]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-accent px-2 py-0.5 border-2 border-black italic">Trier University</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase italic tracking-widest">Campus Network</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] md:leading-none">
            {t('findYourTongue')}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              className="neo-input !pl-12 h-12 md:h-14 w-full text-base md:text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="neo-button h-12 md:h-14 bg-white px-6 grow sm:grow-0">
                  <Filter className="h-5 w-5 mr-2" />
                  <span className="font-bold uppercase text-xs md:text-sm">
                    {filterMajor || t('settings')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="neo-card bg-white p-1 max-h-[300px] overflow-y-auto w-56">
                <DropdownMenuLabel className="font-black italic uppercase text-[10px] tracking-widest">Filter by Major</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black" />
                <DropdownMenuItem 
                  onClick={() => setFilterMajor(null)}
                  className="font-bold uppercase text-xs p-3 hover:bg-primary"
                >
                  All Majors
                </DropdownMenuItem>
                {majors.map(major => (
                  <DropdownMenuItem 
                    key={major} 
                    onClick={() => setFilterMajor(major)}
                    className="font-bold uppercase text-xs p-3 hover:bg-primary"
                  >
                    {major}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {filterMajor && (
              <Button 
                onClick={() => setFilterMajor(null)}
                variant="destructive" 
                className="neo-button h-12 md:h-14 aspect-square p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {[1,2,3,4].map(i => <div key={i} className="neo-card h-[300px] md:h-[400px] bg-white animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <MatchCard key={student.uid} currentUser={profile} student={student} />
            ))
          ) : (
            <div className="col-span-full py-12 md:py-16 text-center neo-card bg-white p-6 md:p-10 flex flex-col items-center">
              <div className="relative h-48 w-48 md:h-64 md:w-64 border-2 border-black shadow-neo mb-8 overflow-hidden">
                <Image 
                  src={noResultsIll} 
                  alt="No results" 
                  fill 
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-2">
                No students found for this search.
              </h3>
              <p className="text-sm font-bold text-muted-foreground uppercase mb-8">
                Try adjusting your filters or search terms
              </p>
              <Button 
                variant="outline" 
                onClick={() => {setSearchQuery(''); setFilterMajor(null);}}
                className="neo-button bg-white h-12 md:h-14 px-8"
              >
                CLEAR ALL FILTERS
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
