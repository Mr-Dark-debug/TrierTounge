'use client';
import { useMemo, DependencyList } from 'react';
import { getFirebaseApp } from './config';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export * from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';

export function initializeFirebase() {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  return { app, db, auth };
}

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}
