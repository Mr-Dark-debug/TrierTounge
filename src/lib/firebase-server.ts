/**
 * Server-side Firebase initialization for API routes.
 * Uses the client SDK initialized with environment variables.
 * This avoids needing Firebase Admin SDK + service account (Blaze plan).
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function getServerApp() {
  // Use a separate app name for server-side to avoid conflicts
  const serverAppName = '__server__';
  try {
    return getApp(serverAppName);
  } catch {
    return initializeApp(firebaseConfig, serverAppName);
  }
}

export const serverDb = getFirestore(getServerApp());
