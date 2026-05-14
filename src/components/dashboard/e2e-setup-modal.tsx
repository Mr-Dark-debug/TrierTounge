"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, KeyRound, AlertTriangle } from "lucide-react"

export function E2ESetupModal({
  isSetup,
  isUnlocked,
  setupE2E,
  unlockE2E
}: {
  isSetup: boolean | null;
  isUnlocked: boolean;
  setupE2E: (passphrase: string) => Promise<boolean>;
  unlockE2E: (passphrase: string) => Promise<boolean>;
}) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If we don't know the status yet, or it's already unlocked, don't show anything
  if (isSetup === null || isUnlocked) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      let success = false;
      if (isSetup === false) {
        success = await setupE2E(passphrase);
      } else {
        success = await unlockE2E(passphrase);
      }

      if (!success) {
        setError(isSetup ? 'Incorrect passphrase. Please try again.' : 'Failed to setup encryption.');
      }
    } catch (e) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none sm:max-w-md pointer-events-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black uppercase text-xl italic tracking-tight">
             {isSetup ? <Lock className="h-5 w-5 text-primary" /> : <KeyRound className="h-5 w-5 text-primary" />}
             {isSetup ? 'Unlock Chats' : 'Setup Encryption'}
          </DialogTitle>
          <DialogDescription className="font-bold text-muted-foreground">
             {isSetup 
               ? 'Enter your backup passphrase to decrypt your private key and unlock your messages on this device.' 
               : 'Create a strong backup passphrase. This secures your messages end-to-end.'}
          </DialogDescription>
        </DialogHeader>
        
        {!isSetup && (
          <div className="bg-yellow-100 border-2 border-yellow-500 p-3 flex gap-3 text-sm font-medium">
             <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
             <p className="text-yellow-800">
               <strong>CRITICAL:</strong> Please write this passphrase down or save it in a password manager. If you lose it, you will lose access to all your chats on new devices. We cannot recover it for you.
             </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <Input 
             type="password"
             value={passphrase}
             onChange={(e) => setPassphrase(e.target.value)}
             placeholder={isSetup ? "Enter your backup passphrase" : "Create a strong passphrase (min 8 chars)"}
             className="neo-input"
             required
          />
          {error && <p className="text-red-500 text-xs font-bold uppercase">{error}</p>}
          <Button 
            type="submit" 
            disabled={loading}
            className="neo-button w-full bg-primary font-black uppercase tracking-widest text-xs" 
          >
            {loading ? 'Processing...' : (isSetup ? 'Unlock' : 'Secure My Chats')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
