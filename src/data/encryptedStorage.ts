import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../context/SettingsContext';
import {
  initEncryption,
  clearEncryptionKey,
  encryptJSON,
  decryptJSON,
  isEncryptionInitialized,
  migrateToEncrypted,
  migrateToPlain,
} from '../utils/encryption';

/** Wrapper for AsyncStorage with optional encryption */
export class EncryptedStorage {
  private key: CryptoKey | null = null;
  private initialized = false;

  /** Initialize encryption if enabled */
  async init(encryptEnabled: boolean): Promise<void> {
    if (encryptEnabled) {
      this.key = await initEncryption();
    } else {
      this.key = null;
    }
    this.initialized = true;
  }

  /** Get item with optional decryption */
  async getItem<T>(key: string, encryptEnabled: boolean): Promise<T | null> {
    if (!this.initialized) await this.init(encryptEnabled);

    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      if (encryptEnabled && this.key) {
        return await decryptJSON<T>(stored, this.key);
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      // If decryption fails, data might be corrupted or key changed
      if (encryptEnabled && error instanceof Error && error.name === 'OperationError') {
        console.warn('Decryption failed - data may be corrupted or encryption key changed');
      }
      return null;
    }
  }

  /** Set item with optional encryption */
  async setItem<T>(key: string, value: T, encryptEnabled: boolean): Promise<void> {
    if (!this.initialized) await this.init(encryptEnabled);

    try {
      if (encryptEnabled && this.key) {
        const encrypted = await encryptJSON(value, this.key);
        await AsyncStorage.setItem(key, encrypted);
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  /** Remove item */
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  /** Migrate data when encryption setting changes */
  async migrate(
    key: string,
    oldEncryptEnabled: boolean,
    newEncryptEnabled: boolean,
  ): Promise<void> {
    if (oldEncryptEnabled === newEncryptEnabled) return;

    if (!this.initialized) await this.init(oldEncryptEnabled);

    try {
      if (newEncryptEnabled && !oldEncryptEnabled) {
        // Enable encryption: encrypt existing plain data
        const plainData = await AsyncStorage.getItem(key);
        if (plainData) {
          const newKey = await initEncryption();
          const encrypted = await encryptJSON(JSON.parse(plainData), newKey);
          await AsyncStorage.setItem(key, encrypted);
        }
      } else if (!newEncryptEnabled && oldEncryptEnabled) {
        // Disable encryption: decrypt existing encrypted data
        const encryptedData = await AsyncStorage.getItem(key);
        if (encryptedData && this.key) {
          const decrypted = await decryptJSON(encryptedData, this.key);
          await AsyncStorage.setItem(key, JSON.stringify(decrypted));
        }
        await clearEncryptionKey();
        this.key = null;
      }
    } catch (error) {
      console.error(`Migration error for ${key}:`, error);
      throw error;
    }
  }
}

/** Singleton instance */
export const encryptedStorage = new EncryptedStorage();

/** Storage keys */
export const STORAGE_KEYS = {
  PLANTINGS: '@grow_calendar_plantings_v1',
  SETTINGS: '@grow_app_settings_v1',
  JOURNAL: '@grow_journal_v1',
} as const;