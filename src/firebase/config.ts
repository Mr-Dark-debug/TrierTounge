'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "placeholder-api-key",
  authDomain: "triertongue-placeholder.firebaseapp.com",
  projectId: "triertongue-placeholder",
  storageBucket: "triertongue-placeholder.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

export const getFirebaseApp = () => {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
};
