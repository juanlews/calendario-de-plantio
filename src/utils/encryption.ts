import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_NAME = 'app_encryption_key_v1';
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128

/** Get the Web Crypto subtle API */
const getSubtle = (): SubtleCrypto => {
  const crypto = globalThis.crypto;
  if (!crypto?.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not available');
  }
  return crypto.subtle;
};

/** Generate a random 256-bit key and store in SecureStore */
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  const subtle = getSubtle();
  const key = await subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable
    ['encrypt', 'decrypt'],
  );

  // Export key to raw format for storage
  const rawKey = await subtle.exportKey('raw', key);
  const keyBase64 = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(new Uint8Array(rawKey)).map((b) => String.fromCharCode(b)).join(''),
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );

  // Store key hash for verification (not the key itself)
  await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, keyBase64);

  return key;
};

/** Get or create encryption key from SecureStore */
export const getEncryptionKey = async (): Promise<CryptoKey | null> => {
  try {
    const keyHash = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    if (!keyHash) return null;

    // Check if we have raw key stored
    const rawKeyB64 = await SecureStore.getItemAsync(`${ENCRYPTION_KEY_NAME}_raw`);
    if (rawKeyB64) {
      const rawKey = Uint8Array.from(atob(rawKeyB64), (c) => c.charCodeAt(0));
      const subtle = getSubtle();
      return await subtle.importKey('raw', rawKey, { name: ALGORITHM }, false, [
        'encrypt',
        'decrypt',
      ]);
    }

    return null;
  } catch {
    return null;
  }
};

/** Initialize encryption - generate key if needed */
export const initEncryption = async (): Promise<CryptoKey> => {
  let key = await getEncryptionKey();
  if (!key) {
    key = await generateEncryptionKey();
    // Store raw key for future use (simplified approach)
    const subtle = getSubtle();
    const rawKey = await subtle.exportKey('raw', key);
    const rawKeyB64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
    await SecureStore.setItemAsync(`${ENCRYPTION_KEY_NAME}_raw`, rawKeyB64);
  }
  return key;
};

/** Clear encryption key (when user disables encryption) */
export const clearEncryptionKey = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
  await SecureStore.deleteItemAsync(`${ENCRYPTION_KEY_NAME}_raw`);
};

/** Encrypt a string value */
export const encryptString = async (plaintext: string, key: CryptoKey): Promise<string> => {
  const subtle = getSubtle();
  const iv = Crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded,
  );

  // Combine IV + ciphertext for storage
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
};

/** Decrypt a string value */
export const decryptString = async (ciphertextB64: string, key: CryptoKey): Promise<string> => {
  const subtle = getSubtle();
  const combined = Uint8Array.from(atob(ciphertextB64), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(decrypted);
};

/** Encrypt JSON data */
export const encryptJSON = async <T>(data: T, key: CryptoKey): Promise<string> => {
  return encryptString(JSON.stringify(data), key);
};

/** Decrypt JSON data */
export const decryptJSON = async <T>(encryptedB64: string, key: CryptoKey): Promise<T> => {
  const decrypted = await decryptString(encryptedB64, key);
  return JSON.parse(decrypted);
};

/** Check if encryption is initialized */
export const isEncryptionInitialized = async (): Promise<boolean> => {
  const keyHash = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
  return !!keyHash;
};

/** Migrate unencrypted data to encrypted */
export const migrateToEncrypted = async <T>(
  storageKey: string,
  loadFn: () => Promise<T>,
  saveEncryptedFn: (data: T) => Promise<void>,
): Promise<void> => {
  const key = await initEncryption();
  const plainData = await loadFn();
  await saveEncryptedFn(plainData);
};

/** Migrate encrypted data to unencrypted */
export const migrateToPlain = async <T>(
  storageKey: string,
  loadEncryptedFn: () => Promise<T>,
  savePlainFn: (data: T) => Promise<void>,
): Promise<void> => {
  const key = await getEncryptionKey();
  if (!key) return;

  const encryptedData = await loadEncryptedFn();
  await savePlainFn(encryptedData);
  await clearEncryptionKey();
};