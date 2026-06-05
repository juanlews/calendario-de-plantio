import { encryptedStorage, STORAGE_KEYS } from './encryptedStorage';
import type { PlantJournalEntry } from '../types/planting';

let getEncryptSetting: () => boolean = () => false;

export const setEncryptSettingGetter = (getter: () => boolean): void => {
  getEncryptSetting = getter;
};

const encryptEnabled = (): boolean => getEncryptSetting();

/** Load ALL journal entries (across all plants) */
export const loadAllJournalEntries = async (): Promise<PlantJournalEntry[]> => {
  try {
    const data = await encryptedStorage.getItem<PlantJournalEntry[]>(STORAGE_KEYS.JOURNAL, encryptEnabled());
    return data ?? [];
  } catch {
    return [];
  }
};

/** Load journal entries for a specific plant */
export const loadJournalEntries = async (plantingId: string): Promise<PlantJournalEntry[]> => {
  const all = await loadAllJournalEntries();
  return all
    .filter((e) => e.plantingId === plantingId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // newest first
};

/** Save all journal entries */
const saveAllJournalEntries = async (entries: PlantJournalEntry[]): Promise<void> => {
  try {
    await encryptedStorage.setItem(STORAGE_KEYS.JOURNAL, entries, encryptEnabled());
  } catch (error) {
    console.error('Erro ao salvar diário:', error);
  }
};

/** Add a journal entry */
export const addJournalEntry = async (entry: PlantJournalEntry): Promise<PlantJournalEntry[]> => {
  const all = await loadAllJournalEntries();
  all.push(entry);
  await saveAllJournalEntries(all);
  return all.filter((e) => e.plantingId === entry.plantingId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

/** Update a journal entry */
export const updateJournalEntry = async (entry: PlantJournalEntry): Promise<PlantJournalEntry[]> => {
  const all = await loadAllJournalEntries();
  const idx = all.findIndex((e) => e.id === entry.id);
  if (idx >= 0) all[idx] = entry;
  await saveAllJournalEntries(all);
  return all.filter((e) => e.plantingId === entry.plantingId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

/** Delete a journal entry */
export const deleteJournalEntry = async (entryId: string): Promise<PlantJournalEntry[]> => {
  const all = await loadAllJournalEntries();
  const entry = all.find((e) => e.id === entryId);
  const filtered = all.filter((e) => e.id !== entryId);
  await saveAllJournalEntries(filtered);
  if (entry) {
    return filtered.filter((e) => e.plantingId === entry.plantingId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

/** Create a journal entry with generated id and timestamp */
export const createJournalEntry = (
  plantingId: string,
  type: PlantJournalEntry['type'],
  overrides: Partial<PlantJournalEntry> = {},
): PlantJournalEntry => {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    plantingId,
    type,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    note: '',
    ...overrides,
  };
};