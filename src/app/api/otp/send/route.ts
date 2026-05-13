import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/firebase-server';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

// Brevo API endpoint for transactional emails
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Use the Brevo account's verified sender email
// This MUST match a verified sender in your Brevo dashboard
// Go to: Brevo → Settings → Senders & IPs → Add/Verify a sender
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'triertongue@gmail.com';
const SENDER_NAME = 'TrierTongue';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email } = body;

    // Validate input
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing uid or email' },
        { status: 400 }
      );
    }

    // Validate university email domain
    if (!email.toLowerCase().endsWith('@uni-trier.de')) {
      return NextResponse.json(
        { error: 'Only @uni-trier.de email addresses are allowed.' },
        { status: 400 }
      );
    }

    // Check Brevo API key
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes

    // Store OTP in Firestore temp_verification collection
    await setDoc(doc(serverDb, 'temp_verification', uid), {
      uid,
      email,
      otp,
      expiresAt,
      createdAt: Timestamp.now(),
      attempts: 0
    });

    // Send email via Brevo REST API
    const emailPayload = {
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL
      },
      to: [
        {
          email: email,
          name: email.split('@')[0]
        }
      ],
      subject: 'TrierTongue – Your Verification Code',
      htmlContent: `
        <div style="font-family: 'Arial', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FAFAF5; border: 3px solid #000;">
          <div style="background: #C6F135; padding: 16px 24px; border: 2px solid #000; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -1px;">
              TRIERTONGUE.
            </h1>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">
            Verify Your Email
          </h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 24px;">
            Use the code below to verify your <strong>@uni-trier.de</strong> email address.
          </p>
          
          <div style="background: #000; color: #C6F135; padding: 20px; text-align: center; border: 2px solid #000; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #888; font-size: 12px; margin-bottom: 8px;">
            This code expires in <strong>10 minutes</strong>.
          </p>
          <p style="color: #888; font-size: 12px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
          
          <hr style="border: 1px solid #ddd; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
            University of Trier · Language Exchange Platform
          </p>
        </div>
      `
    };

    const brevoResponse = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(emailPayload)
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json().catch(() => ({}));
      console.error('Brevo API error:', brevoResponse.status, errorData);
      
      // Provide specific error messages based on Brevo's response
      if (brevoResponse.status === 401) {
        const msg = errorData?.message || '';
        if (msg.includes('unrecognised IP') || msg.includes('authorised_ips')) {
          return NextResponse.json(
            { error: 'Brevo is blocking this IP. Go to Brevo → Settings → Security → Authorized IPs → Deactivate IP blocking for API keys.' },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: 'Brevo API key is invalid or unauthorized. Check your BREVO_API_KEY in .env' },
          { status: 500 }
        );
      }

      if (errorData?.message?.includes('sender')) {
        return NextResponse.json(
          { error: `Sender email not verified in Brevo. Go to Brevo → Settings → Senders & IPs → Verify "${SENDER_EMAIL}"` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Email service error: ${errorData?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });

  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
