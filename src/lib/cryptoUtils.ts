"use client";

const ITERATIONS = 600000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

export const generateKeyPair = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );
};

export const exportPublicKey = async (key: CryptoKey) => {
  return await window.crypto.subtle.exportKey("jwk", key);
};

export const exportPrivateKey = async (key: CryptoKey) => {
  return await window.crypto.subtle.exportKey("jwk", key);
};

export const importPublicKey = async (jwk: JsonWebKey) => {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    []
  );
};

export const importPrivateKey = async (jwk: JsonWebKey) => {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );
};

export const deriveKeyFromPassphrase = async (passphrase: string, salt: Uint8Array) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptPrivateKey = async (privateKeyJwk: JsonWebKey, passphrase: string) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(privateKeyJwk));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  return {
    encryptedPrivateKey: bufferToBase64(new Uint8Array(encrypted)),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
  };
};

export const decryptPrivateKey = async (encryptedBase64: string, passphrase: string, saltBase64: string, ivBase64: string) => {
  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);
  const encrypted = base64ToBuffer(encryptedBase64);
  
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encrypted
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decrypted)) as JsonWebKey;
};

export const deriveSharedSecret = async (privateKey: CryptoKey, publicKey: CryptoKey) => {
  return await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptText = async (text: string, sharedKey: CryptoKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const enc = new TextEncoder();
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    sharedKey,
    enc.encode(text)
  );

  return {
    ciphertext: bufferToBase64(new Uint8Array(encrypted)),
    iv: bufferToBase64(iv),
  };
};

export const decryptText = async (ciphertextBase64: string, ivBase64: string, sharedKey: CryptoKey) => {
  try {
    const iv = base64ToBuffer(ivBase64);
    const ciphertext = base64ToBuffer(ciphertextBase64);
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      sharedKey,
      ciphertext
    );
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (e) {
    console.error("Decryption failed", e);
    return "[Message could not be decrypted]";
  }
};

export const bufferToBase64 = (buffer: Uint8Array) => {
  return btoa(String.fromCharCode(...buffer));
};

export const base64ToBuffer = (base64: string) => {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
};

export const saveToIDB = (key: string, value: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('trier-e2e', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('keys');
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('keys', 'readwrite');
      tx.objectStore('keys').put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getFromIDB = (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('trier-e2e', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('keys');
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('keys', 'readonly');
      const req = tx.objectStore('keys').get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
    request.onerror = () => reject(request.error);
  });
};
