
"use client"

import { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { MatchCard } from '@/components/dashboard/match-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Sparkles } from 'lucide-react';

export function DiscoveryTab({ profile }: { profile: any }) {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMajor, setFilterMajor] = useState<string | null>(null);

  // Fetch potential language partners (simplified discovery)
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'users'),
      where('onboardingCompleted', '==', true),
      limit(20)
    );
  }, [db]);

  const { data: students, loading } = useCollection(studentsQuery);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => {
      if (s.uid === profile.uid) return false;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.major.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMajor = !filterMajor || s.major === filterMajor;
      return matchesSearch && matchesMajor;
    });
  }, [students, searchQuery, filterMajor, profile.uid]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-accent px-2 py-0.5 border-2 border-black">Trier University</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Campus Network</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] md:leading-none">
            FIND YOUR<br className="hidden md:block"/> TONGUE.
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by major, name..." 
              className="neo-input pl-12 h-12 md:h-14 w-full text-base md:text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="neo-button h-12 md:h-14 bg-white px-6 w-full sm:w-auto">
            <Filter className="h-5 w-5 mr-2 sm:mr-0" />
            <span className="sm:hidden font-bold">FILTERS</span>
          </Button>
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
            <div className="col-span-full py-16 md:py-20 text-center neo-card bg-white border-dashed p-6">
              <Sparkles className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-lg md:text-xl font-black italic uppercase text-muted-foreground">No students found for this search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
