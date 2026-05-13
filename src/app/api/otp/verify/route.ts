import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/firebase-server';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, otp } = body;

    // Validate input
    if (!uid || !otp) {
      return NextResponse.json(
        { error: 'Missing uid or otp' },
        { status: 400 }
      );
    }

    // Fetch the stored OTP document
    const verificationRef = doc(serverDb, 'temp_verification', uid);
    const verificationSnap = await getDoc(verificationRef);

    if (!verificationSnap.exists()) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 404 }
      );
    }

    const verificationData = verificationSnap.data();

    // Check max attempts
    if (verificationData.attempts >= MAX_ATTEMPTS) {
      await deleteDoc(verificationRef);
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Check expiration
    const expiresAt = verificationData.expiresAt?.toDate?.() || new Date(verificationData.expiresAt);
    if (new Date() > expiresAt) {
      await deleteDoc(verificationRef);
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Compare OTP
    if (verificationData.otp !== otp.trim()) {
      // Increment attempts counter
      await updateDoc(verificationRef, {
        attempts: (verificationData.attempts || 0) + 1
      });
      
      const remaining = MAX_ATTEMPTS - (verificationData.attempts || 0) - 1;
      return NextResponse.json(
        { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // OTP is correct — delete the temp verification document
    await deleteDoc(verificationRef);

    // Return success — the CLIENT will update the user profile with isVerified: true
    // (because the server-side SDK has no user auth context to write to the users collection)
    return NextResponse.json({ success: true, message: 'Email verified successfully!' });

  } catch (error: any) {
    console.error('OTP Verify Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
