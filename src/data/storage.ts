import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CannabisPlanting, CannabisGenetics, FloweringType, GrowthStage } from '../types/planting';
import { getStrainInfo } from '../data/strains';
import { calculateStage, addDaysToDate } from '../utils/dateUtils';

const STORAGE_KEY = '@grow_calendar_plantings_v1';

export const loadPlantings = async (): Promise<CannabisPlanting[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const savePlantings = async (plantings: CannabisPlanting[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plantings));
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
  // Color by genetics
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

  // Expected flowering: auto starts flowering ~25 days from seed
  // Photo needs manual switch, we don't set expected flowering date
  const expectedFloweringDate = isAuto && autoflowerDays
    ? addDaysToDate(seedDate, Math.round(autoflowerDays * 0.7))
    : null;

  // Expected harvest
  let expectedHarvestDate: string | null = null;
  if (isAuto && autoflowerDays) {
    expectedHarvestDate = addDaysToDate(seedDate, autoflowerDays);
  } else if (floweringDays > 0) {
    // Photo: seed + ~30 days veg + flowering days
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
    vegetativeDate: seedDate,
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
