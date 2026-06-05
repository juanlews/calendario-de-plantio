import { encryptedStorage, STORAGE_KEYS } from './encryptedStorage';
import { useSettings } from '../context/SettingsContext';
import type { AppSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

let getEncryptSetting: () => boolean = () => false;

export const setEncryptSettingGetter = (getter: () => boolean): void => {
  getEncryptSetting = getter;
};

const encryptEnabled = (): boolean => getEncryptSetting();

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const data = await encryptedStorage.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, encryptEnabled());
    return data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await encryptedStorage.setItem(STORAGE_KEYS.SETTINGS, settings, encryptEnabled());
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
};