"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useSystemAnnouncements } from "@/hooks/use-system-announcements"
import { Sparkles } from "lucide-react"

export function SystemAnnouncementModal({ userId }: { userId: string }) {
  const { activeAnnouncement, dismissAnnouncement } = useSystemAnnouncements(userId);

  if (!activeAnnouncement) return null;

  return (
    <Dialog open={!!activeAnnouncement} onOpenChange={(open) => { if (!open) dismissAnnouncement(); }}>
      <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black uppercase text-xl italic tracking-tight">
             <Sparkles className="h-5 w-5 text-primary" />
             What's New!
          </DialogTitle>
          <DialogDescription className="font-bold text-muted-foreground">
             {activeAnnouncement.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 whitespace-pre-wrap font-medium">
           {activeAnnouncement.body}
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            className="neo-button w-full bg-primary font-black uppercase tracking-widest text-xs" 
            onClick={dismissAnnouncement}
          >
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
