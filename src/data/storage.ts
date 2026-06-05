import { encryptedStorage, STORAGE_KEYS } from './encryptedStorage';
import { useSettings } from '../context/SettingsContext';
import type { CannabisPlanting, CannabisGenetics, FloweringType, GrowthStage } from '../types/planting';
import { getStrainInfo } from '../data/strains';
import { calculateStage, addDaysToDate } from '../utils/dateUtils';

// We need a way to get settings without hook for use in storage functions
// This will be set by the SettingsProvider
let getEncryptSetting: () => boolean = () => false;

export const setEncryptSettingGetter = (getter: () => boolean): void => {
  getEncryptSetting = getter;
};

const encryptEnabled = (): boolean => getEncryptSetting();

export const loadPlantings = async (): Promise<CannabisPlanting[]> => {
  try {
    const data = await encryptedStorage.getItem<CannabisPlanting[]>(STORAGE_KEYS.PLANTINGS, encryptEnabled());
    return data ?? [];
  } catch {
    return [];
  }
};

export const savePlantings = async (plantings: CannabisPlanting[]): Promise<void> => {
  try {
    await encryptedStorage.setItem(STORAGE_KEYS.PLANTINGS, plantings, encryptEnabled());
  } catch (error) {
    console.error('Erro ao salvar plantios:', error);
  }
};

export const addPlanting = async (p: CannabisPlanting): Promise<CannabisPlanting[]> => {
  const current = await loadPlantings();
  const updated = [...current, p];
  await savePlantings(updated);
  return updated;
};

export const updatePlanting = async (p: CannabisPlanting): Promise<CannabisPlanting[]> => {
  const current = await loadPlantings();
  const updated = current.map((item) => (item.id === p.id ? p : item));
  await savePlantings(updated);
  return updated;
};

export const deletePlanting = async (id: string): Promise<CannabisPlanting[]> => {
  const current = await loadPlantings();
  const updated = current.filter((item) => item.id !== id);
  await savePlantings(updated);
  return updated;
};

function typeColor(genetics: CannabisGenetics, floweringType: FloweringType): string {
  if (genetics === 'indica') return '#7B1FA2';
  if (genetics === 'sativa') return '#1565C0';
  if (genetics === 'hybrid') return '#2E7D32';
  return '#2E7D32';
}

/** Create a CannabisPlanting from strain info and seed date */
export const createCannabisPlanting = (
  strainName: string,
  genetics: CannabisGenetics,
  floweringType: FloweringType,
  seedDate: string,
  floweringDays: number,
  autoflowerDays: number | undefined,
  quantity: number = 1,
  notes: string = '',
  nickname: string = '',
  initialStage?: GrowthStage,
): CannabisPlanting => {
  const isAuto = floweringType === 'autoflower';

  const expectedFloweringDate = isAuto && autoflowerDays
    ? addDaysToDate(seedDate, Math.round(autoflowerDays * 0.7))
    : null;

  let expectedHarvestDate: string | null = null;
  if (isAuto && autoflowerDays) {
    expectedHarvestDate = addDaysToDate(seedDate, autoflowerDays);
  } else if (floweringDays > 0) {
    expectedHarvestDate = addDaysToDate(seedDate, 30 + floweringDays);
  }

  const stage = initialStage ?? calculateStage(seedDate, null, null, floweringDays, floweringType);

  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    nickname: nickname.trim() || undefined,
    strainName,
    genetics,
    floweringType,
    seedDate,
    vegetativeDate: null,
    floweringDate: null,
    harvestDate: null,
    expectedFloweringDate,
    expectedHarvestDate,
    floweringDays,
    currentStage: stage,
    quantity,
    notes,
    color: typeColor(genetics, floweringType),
  };
};