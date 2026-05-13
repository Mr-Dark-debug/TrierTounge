'use client';
import { useState, useEffect } from 'react';
import { DocumentReference, onSnapshot, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

export function useDoc<T = DocumentData>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dataPath, setDataPath] = useState<string | null>(null);

  // We use a string derived from the ref to avoid infinite loops
  // if the caller passes a new DocumentReference object on every render
  const refPath = ref?.path || null;

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setDataPath(null);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setData(snapshot.data() as T || null);
        setDataPath(ref.path);
        setLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setDataPath(ref.path);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refPath]); // depend on refPath string, not the ref object

  // If we have a ref, but the data we have is from a different path (or no path yet),
  // we are definitely still loading, even if the state update hasn't run yet.
  const isActuallyLoading = ref ? (loading || dataPath !== ref.path) : loading;

  return { data, loading: isActuallyLoading, error };
}
