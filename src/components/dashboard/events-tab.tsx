"use client"

import { useState, useMemo, useRef, useEffect } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, arrayUnion, onSnapshot, getDocs, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, User, Plus, Clock, Info, CheckCircle, CreditCard, MessageCircle, X, ChevronLeft, Send, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import illEvents from '@/assets/ill events.jpg';

interface EventsTabProps {
  profile: any;
}

export function EventsTab({ profile }: EventsTabProps) {
  const [view, setView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (view === 'create') {
    return <CreateEventView profile={profile} onBack={() => setView('list')} />;
  }

  if (view === 'details' && selectedEventId) {
    return <EventDetailsView profile={profile} eventId={selectedEventId} onBack={() => { setView('list'); setSelectedEventId(null); }} />;
  }

  return <EventsListView profile={profile} onCreateClick={() => setView('create')} onEventClick={(id: string) => { setSelectedEventId(id); setView('details'); }} />;
}

function EventsListView({ profile, onCreateClick, onEventClick }: any) {
  const db = useFirestore();
  const [search, setSearch] = useState('');
  
  const eventsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  }, [db]);
  
  const { data: events, loading } = useCollection(eventsQuery);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const sq = search.toLowerCase();
    return events.filter((e: any) => e.title?.toLowerCase().includes(sq) || e.location?.toLowerCase().includes(sq));
  }, [events, search]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-accent px-2 py-0.5 border-2 border-black tracking-widest">Campus Life</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
            CAMPUS<br/>EVENTS.
          </h2>
        </div>
        <Button onClick={onCreateClick} className="neo-button bg-primary h-14 px-8 flex items-center gap-2 text-sm">
          <Plus className="h-5 w-5" /> CREATE EVENT
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search events by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="neo-input !pl-12 h-14 w-full text-lg"
        />
      </div>

      {loading ? (
        <div className="text-center font-bold italic py-20 uppercase tracking-widest opacity-50">Loading Events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 border-2 border-black border-dashed bg-white">
          <div className="relative h-48 w-48 mx-auto mb-6 border-2 border-black overflow-hidden shadow-neo-sm">
            <Image src={illEvents} alt="No events" fill className="object-cover" />
          </div>
          <p className="font-black italic uppercase text-xl">No Events Found</p>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev: any) => (
            <div 
              key={ev.id} 
              onClick={() => onEventClick(ev.id)}
              className="neo-card bg-white cursor-pointer hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col group"
            >
              <div className="relative h-48 w-full border-b-2 border-black bg-muted overflow-hidden">
                {ev.posterBase64 ? (
                  <Image src={ev.posterBase64} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-accent/20">
                    <Calendar className="h-12 w-12 text-accent opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                  {ev.isPaid === 'paid' ? 'PAID' : 'FREE'}
                </div>
              </div>
              <div className="p-4 md:p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-black italic uppercase leading-none mb-4 line-clamp-2">{ev.title}</h3>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary shrink-0" /> {ev.date} • {ev.time} {ev.amPm}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                    <MapPin className="h-4 w-4 text-accent shrink-0" /> {ev.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" /> {ev.attendees?.length || 0} Attending
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateEventView({ profile, onBack }: any) {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [poster, setPoster] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    amPm: 'PM',
    about: '',
    allowed: 'All Students',
    isPaid: 'free',
    paymentMode: ''
  });

  const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Under 10MB please.', variant: 'destructive' });
      return;
    }
    try {
      const base64 = await compressImageToBase64(file);
      setPoster(base64);
    } catch (err) {
      toast({ title: 'Error processing image', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        posterBase64: poster,
        creatorId: profile.uid,
        creatorName: profile.name,
        attendees: [profile.uid],
        createdAt: serverTimestamp()
      });
      toast({ title: 'Event Created Successfully!' });
      onBack();
    } catch (err) {
      toast({ title: 'Failed to create event', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-300 max-w-3xl mx-auto pb-20">
      <Button variant="ghost" onClick={onBack} className="font-bold uppercase tracking-widest text-xs hover:bg-transparent -ml-4">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Events
      </Button>

      <div>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">Create Event</h2>
        <p className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Host a gathering for the community</p>
      </div>

      <form onSubmit={handleSubmit} className="neo-card bg-white p-6 md:p-10 space-y-8">
        {/* Poster Upload */}
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest">Event Poster (Optional)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-48 w-full border-2 border-black border-dashed bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden"
          >
            {poster ? (
              <Image src={poster} alt="Poster preview" fill className="object-cover" />
            ) : (
              <>
                <Plus className="h-8 w-8 mb-2 opacity-50" />
                <span className="font-bold text-sm uppercase opacity-50">Click to upload image</span>
              </>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          {poster && <Button type="button" variant="ghost" onClick={(e) => { e.stopPropagation(); setPoster(''); }} className="text-xs text-red-500 font-bold uppercase">Remove Image</Button>}
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest">Event Title *</label>
          <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="neo-input h-14" placeholder="e.g. Language Exchange Cafe" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest">Location *</label>
            <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="neo-input h-14" placeholder="e.g. Mensa, Room 101" />
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest">Who's Allowed?</label>
            <Input value={formData.allowed} onChange={e => setFormData({...formData, allowed: e.target.value})} className="neo-input h-14" placeholder="e.g. All Students, Masters Only" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-widest">Date *</label>
            <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="neo-input h-14 w-full" />
          </div>
          <div className="space-y-4 md:col-span-1">
            <label className="text-xs font-black uppercase tracking-widest">Time *</label>
            <Input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="neo-input h-14 w-full flex-1" />
          </div>
          <div className="space-y-4 md:col-span-1">
            <label className="text-xs font-black uppercase tracking-widest">AM / PM</label>
            <Select value={formData.amPm} onValueChange={(value) => setFormData({...formData, amPm: value})}>
              <SelectTrigger className="w-full neo-input h-14 bg-white">
                <SelectValue placeholder="Select AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border-2 border-black bg-[#fafafa]">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><CreditCard className="h-4 w-4" /> Cost</label>
            <Select value={formData.isPaid} onValueChange={(value) => setFormData({...formData, isPaid: value, paymentMode: value === 'free' ? '' : formData.paymentMode})}>
              <SelectTrigger className="w-full neo-input h-14 bg-white">
                <SelectValue placeholder="Select Cost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">FREE</SelectItem>
                <SelectItem value="paid">PAID</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <label className={cn("text-xs font-black uppercase tracking-widest", formData.isPaid === 'free' && "opacity-50")}>
              Payment Mode
            </label>
            <Input 
              required={formData.isPaid === 'paid'} 
              disabled={formData.isPaid === 'free'}
              value={formData.paymentMode} 
              onChange={e => setFormData({...formData, paymentMode: e.target.value})} 
              className="neo-input h-14 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted" 
              placeholder="e.g. Cash only, Card, PayPal" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest">About the Event *</label>
          <textarea 
            required 
            value={formData.about} 
            onChange={e => setFormData({...formData, about: e.target.value})} 
            className="w-full neo-input min-h-[150px] p-4 resize-y" 
            placeholder="Describe what will happen at the event..."
          />
        </div>

        <Button disabled={isSubmitting} type="submit" className="neo-button w-full h-16 text-lg bg-primary">
          {isSubmitting ? 'CREATING...' : 'PUBLISH EVENT'}
        </Button>
      </form>
    </div>
  );
}

function EventDetailsView({ profile, eventId, onBack }: any) {
  const db = useFirestore();
  const { toast } = useToast();
  const [eventData, setEventData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [attendeeProfiles, setAttendeeProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const unsubEvent = onSnapshot(doc(db, 'events', eventId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data: any = { id: docSnapshot.id, ...docSnapshot.data() };
        setEventData(data);
        
        // Fetch attendee profiles
        if (data.attendees && data.attendees.length > 0) {
          // In a real app we'd fetch in batches if > 10, for now we do simple fetch
          const fetchAttendees = async () => {
             const attendeeDocs = await Promise.all(
               data.attendees.map((uid: string) => getDocs(query(collection(db, 'users'), where('uid', '==', uid))))
             );
             const profiles = attendeeDocs.flatMap((snap: any) => snap.docs.map((d: any) => d.data()));
             setAttendeeProfiles(profiles);
          };
          fetchAttendees();
        }
      }
    });

    const unsubComments = onSnapshot(query(collection(db, `events/${eventId}/comments`), orderBy('createdAt', 'asc')), (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubEvent(); unsubComments(); };
  }, [db, eventId]);

  const handleJoin = async () => {
    if (!db || !eventData) return;
    setIsJoining(true);
    try {
      await updateDoc(doc(db, 'events', eventId), {
        attendees: arrayUnion(profile.uid)
      });
      toast({ title: 'Joined Event!' });
    } catch (err) {
      toast({ title: 'Error joining event', variant: 'destructive' });
    } finally {
      setIsJoining(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newComment.trim()) return;
    try {
      await addDoc(collection(db, `events/${eventId}/comments`), {
        text: newComment.trim(),
        authorId: profile.uid,
        authorName: profile.name,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      toast({ title: 'Failed to post comment', variant: 'destructive' });
    }
  };

  if (!eventData) return <div className="p-20 text-center font-bold animate-pulse">Loading Event...</div>;

  const isAttending = eventData.attendees?.includes(profile.uid);
  const isCreator = eventData.creatorId === profile.uid;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-300 max-w-4xl mx-auto pb-20">
      <Button variant="ghost" onClick={onBack} className="font-bold uppercase tracking-widest text-xs hover:bg-transparent -ml-4">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Events
      </Button>

      <div className="neo-card bg-white overflow-hidden flex flex-col md:flex-row">
        {eventData.posterBase64 && (
          <div className="w-full md:w-1/3 relative min-h-[300px] border-b-2 md:border-b-0 md:border-r-2 border-black bg-muted">
            <Image src={eventData.posterBase64} alt={eventData.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-6 md:p-10 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black tracking-widest", eventData.isPaid === 'paid' ? "bg-red-400 text-white" : "bg-primary")}>
              {eventData.isPaid === 'paid' ? 'PAID EVENT' : 'FREE EVENT'}
            </span>
            {eventData.isPaid === 'paid' && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-2 border-dashed border-black px-2 py-0.5">
                {eventData.paymentMode}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black italic uppercase leading-none mb-6">{eventData.title}</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">When</p>
                <p className="font-bold">{eventData.date} • {eventData.time} {eventData.amPm}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-accent" />
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Where</p>
                <p className="font-bold">{eventData.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-black" />
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Coordinator</p>
                <p className="font-bold">{eventData.creatorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Allowed</p>
                <p className="font-bold">{eventData.allowed || 'Everyone'}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-black text-sm uppercase tracking-widest mb-2 border-b-2 border-black pb-2">About</h4>
            <p className="font-medium whitespace-pre-wrap leading-relaxed">{eventData.about}</p>
          </div>

          <div className="mt-auto pt-6 border-t-2 border-black border-dashed">
            {!isAttending ? (
              <Button disabled={isJoining} onClick={handleJoin} className="neo-button w-full h-14 bg-primary text-lg">
                {isJoining ? 'JOINING...' : 'JOIN EVENT'}
              </Button>
            ) : (
              <div className="w-full h-14 bg-accent border-2 border-black flex items-center justify-center font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle className="h-5 w-5 mr-2" /> YOU ARE ATTENDING
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="neo-card bg-white p-6">
            <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Discussion</h3>
            
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-sm font-bold text-muted-foreground italic text-center py-4">No comments yet. Start the discussion!</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="p-4 border-2 border-black bg-[#fafafa]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black uppercase text-xs tracking-widest">{c.authorName}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{c.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}</span>
                    </div>
                    <p className="text-sm font-medium">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="flex gap-2">
              <Input 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                placeholder="Ask a question or leave a comment..." 
                className="neo-input flex-1 h-12"
              />
              <Button type="submit" disabled={!newComment.trim()} className="neo-button h-12 px-6 bg-accent">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="neo-card bg-white p-6">
            <h3 className="text-xl font-black italic uppercase mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> Attendees ({eventData.attendees?.length || 0})</h3>
            
            {(isCreator || isAttending) ? (
              <div className="space-y-3">
                {attendeeProfiles.map(p => (
                  <div key={p.uid} className="flex items-center gap-3 p-2 border-2 border-black hover:bg-muted/20 transition-colors">
                    <div className="relative h-10 w-10 border-2 border-black bg-muted overflow-hidden shrink-0">
                       <Image src={p.photoURL || `https://picsum.photos/seed/${p.uid}/100/100`} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black uppercase text-xs truncate">{p.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{p.major}</p>
                    </div>
                  </div>
                ))}
                {attendeeProfiles.length === 0 && <p className="text-xs font-bold text-muted-foreground">No one has joined yet.</p>}
              </div>
            ) : (
              <div className="p-4 border-2 border-black border-dashed bg-muted/10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Join event to see attendees</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
