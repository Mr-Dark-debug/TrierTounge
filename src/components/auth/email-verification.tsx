"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, ShieldCheck, RefreshCcw, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useFirestore } from '@/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

interface EmailVerificationProps {
  user: any;
  onVerified: () => void;
  onLogout: () => void;
}

export function EmailVerification({ user, onVerified, onLogout }: EmailVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();
  const db = useFirestore();

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const sendOTP = useCallback(async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send verification code');
        return;
      }

      setHasSent(true);
      setCooldown(60); // 60 second cooldown
      setOtp(Array(6).fill(''));
      toast({
        title: "Code Sent!",
        description: `Verification code sent to ${user.email}`
      });

      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  }, [user, cooldown, isSending, toast]);

  // Auto-send on mount
  useEffect(() => {
    if (!hasSent) {
      sendOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, otp: code })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        // Clear inputs on wrong code
        if (res.status === 400) {
          setOtp(Array(6).fill(''));
          inputRefs.current[0]?.focus();
        }
        return;
      }

      // Write isVerified: true to user's Firestore profile (client-side has auth context)
      if (db) {
        await setDoc(doc(db, 'users', user.uid), {
          isVerified: true,
          verifiedAt: Timestamp.now(),
          email: user.email,
          uid: user.uid
        }, { merge: true });
      }

      toast({
        title: "Email Verified! ✓",
        description: "Your university email has been confirmed."
      });

      onVerified();
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInput = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (digit && index === 5) {
      const code = [...newOtp.slice(0, 5), digit].join('');
      if (code.length === 6) {
        setTimeout(() => verifyOTP(), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      verifyOTP();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 0) return;

    const newOtp = Array(6).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError(null);

    // Focus the next empty slot or last one
    const nextEmptyIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextEmptyIndex]?.focus();

    // Auto-submit if pasted full code
    if (pastedData.length === 6) {
      setTimeout(() => verifyOTP(), 100);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center bg-primary p-4 border-2 border-black mx-auto">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">
            Verify Your Email
          </h1>
          <p className="text-sm font-bold text-muted-foreground">
            We sent a 6-digit code to
          </p>
          <div className="neo-card bg-primary/20 p-3 inline-block">
            <span className="font-black text-sm tracking-tight">{user.email}</span>
          </div>
        </div>

        {/* OTP Input Grid */}
        <div className="neo-card bg-white p-6 md:p-8 space-y-6">
          <div className="flex justify-center gap-2 md:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  "w-12 h-14 md:w-14 md:h-16 text-center text-2xl md:text-3xl font-black border-2 border-black outline-none transition-all",
                  digit ? "bg-primary/20" : "bg-white",
                  error ? "border-red-500 shake" : "focus:border-accent focus:ring-2 focus:ring-accent/50"
                )}
                disabled={isVerifying}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-3 text-center animate-in fade-in slide-in-from-top-2">
              <p className="text-xs md:text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={verifyOTP}
            disabled={otp.join('').length !== 6 || isVerifying}
            className="w-full neo-button h-14 text-base uppercase tracking-wider"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" /> Verify Code
              </>
            )}
          </Button>

          {/* Resend Section */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-black border-dashed">
            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              onClick={sendOTP}
              disabled={cooldown > 0 || isSending}
              className="text-xs font-black uppercase underline underline-offset-4 hover:text-accent transition-colors p-0 h-auto"
            >
              {isSending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCcw className="h-3 w-3 mr-1" />
              )}
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
            <ShieldCheck className="h-3 w-3" /> Code expires in 10 minutes
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-xs font-bold border-2 border-black neo-button bg-white h-8 px-4"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
