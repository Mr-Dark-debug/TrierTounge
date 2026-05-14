"use client";

import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  generateKeyPair,
  exportPublicKey,
  exportPrivateKey,
  encryptPrivateKey,
  decryptPrivateKey,
  deriveSharedSecret,
  encryptText,
  decryptText,
  importPublicKey,
  importPrivateKey,
  saveToIDB,
  getFromIDB
} from '@/lib/cryptoUtils';

export function useE2E(userId: string | undefined) {
  const db = useFirestore();
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);

  // Check if E2EE is setup
  useEffect(() => {
    if (!db || !userId) return;
    
    const checkSetup = async () => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.publicKey && data.encryptedPrivateKey) {
          setIsSetup(true);
          // Try to get key from IDB
          const storedKeyJwk = await getFromIDB(`privateKey_${userId}`);
          if (storedKeyJwk) {
            const importedKey = await importPrivateKey(storedKeyJwk);
            setPrivateKey(importedKey);
            setIsUnlocked(true);
          }
        } else {
          setIsSetup(false);
        }
      }
    };
    checkSetup();
  }, [db, userId]);

  const setupE2E = async (passphrase: string) => {
    if (!db || !userId) return false;
    
    try {
      const keyPair = await generateKeyPair();
      const pubKeyJwk = await exportPublicKey(keyPair.publicKey);
      const privKeyJwk = await exportPrivateKey(keyPair.privateKey);
      
      const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privKeyJwk, passphrase);

      await setDoc(doc(db, 'users', userId), {
        publicKey: pubKeyJwk,
        encryptedPrivateKey,
        passphraseSalt: salt,
        passphraseIv: iv
      }, { merge: true });

      // Save raw to IDB for local fast unlock
      await saveToIDB(`privateKey_${userId}`, privKeyJwk);
      setPrivateKey(keyPair.privateKey);
      setIsSetup(true);
      setIsUnlocked(true);
      return true;
    } catch (e) {
      console.error("Failed to setup E2EE", e);
      return false;
    }
  };

  const unlockE2E = async (passphrase: string) => {
    if (!db || !userId) return false;

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return false;
      
      const data = userDoc.data();
      if (!data.encryptedPrivateKey || !data.passphraseSalt || !data.passphraseIv) return false;

      const privKeyJwk = await decryptPrivateKey(
        data.encryptedPrivateKey,
        passphrase,
        data.passphraseSalt,
        data.passphraseIv
      );

      const importedKey = await importPrivateKey(privKeyJwk);
      await saveToIDB(`privateKey_${userId}`, privKeyJwk);
      setPrivateKey(importedKey);
      setIsUnlocked(true);
      return true;
    } catch (e) {
      console.error("Failed to unlock E2EE", e);
      return false;
    }
  };

  return {
    isSetup,
    isUnlocked,
    setupE2E,
    unlockE2E,
    privateKey
  };
}

export function useE2EEChat(userId: string | undefined, activeChatId: string | null, privateKey: CryptoKey | null) {
  const db = useFirestore();
  const [messages, setMessages] = useState<any[]>([]);
  const [sharedSecret, setSharedSecret] = useState<CryptoKey | null>(null);

  // Derive shared secret in background (non-blocking)
  useEffect(() => {
    if (!db || !userId || !activeChatId || !privateKey) {
      setSharedSecret(null);
      return;
    }

    const deriveSecret = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', activeChatId));
        if (matchDoc.exists()) {
          const otherId = matchDoc.data().participants.find((p: string) => p !== userId);
          const otherUserDoc = await getDoc(doc(db, 'users', otherId));
          if (otherUserDoc.exists()) {
            const otherPublicKeyJwk = otherUserDoc.data().publicKey;
            if (otherPublicKeyJwk) {
              const otherPublicKey = await importPublicKey(otherPublicKeyJwk);
              const secret = await deriveSharedSecret(privateKey, otherPublicKey);
              setSharedSecret(secret);
            }
          }
        }
      } catch (err) {
        console.warn('E2EE key derivation failed, using plaintext:', err);
      }
    };
    deriveSecret();
  }, [db, userId, activeChatId, privateKey]);

  // Listen to messages IMMEDIATELY — don't wait for sharedSecret
  useEffect(() => {
    if (!db || !activeChatId) return;

    const q = query(
      collection(db, 'matches', activeChatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newMessages: any[] = [];
      for (const msgDoc of snapshot.docs) {
        const data = msgDoc.data();
        if (data.ciphertext && data.iv && sharedSecret) {
          try {
            const plainText = await decryptText(data.ciphertext, data.iv, sharedSecret);
            newMessages.push({ id: msgDoc.id, ...data, text: plainText });
          } catch {
            newMessages.push({ id: msgDoc.id, ...data, text: '🔒 Encrypted' });
          }
        } else if (data.text) {
          // Plaintext message (legacy or fallback)
          newMessages.push({ id: msgDoc.id, ...data });
        } else if (data.ciphertext) {
          // Encrypted but no key yet
          newMessages.push({ id: msgDoc.id, ...data, text: '🔒 Decrypting...' });
        }
      }
      setMessages(newMessages);
    }, (error) => {
      console.error('Messages snapshot error:', error);
    });

    return () => unsubscribe();
  }, [db, activeChatId, sharedSecret]);

  const sendEncryptedMessage = async (text: string) => {
    if (!db || !activeChatId || !userId) return;

    if (sharedSecret) {
      // E2EE is ready — send encrypted
      const { ciphertext, iv } = await encryptText(text, sharedSecret);
      await addDoc(collection(db, 'matches', activeChatId, 'messages'), {
        senderId: userId,
        ciphertext,
        iv,
        timestamp: serverTimestamp(),
        status: 'sent'
      });
    } else {
      // E2EE not ready yet — send plaintext so user isn't blocked
      await addDoc(collection(db, 'matches', activeChatId, 'messages'), {
        senderId: userId,
        text,
        timestamp: serverTimestamp(),
        status: 'sent'
      });
    }
  };

  return {
    messages,
    sendEncryptedMessage,
    // Always ready — E2EE bootstraps in background
    isReady: true,
    isEncrypted: !!sharedSecret
  };
}
