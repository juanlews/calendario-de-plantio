export type CannabisGenetics = 'indica' | 'sativa' | 'hybrid';
export type FloweringType = 'autoflower' | 'photoperiodic';
export type GrowthStage = 'germinação' | 'muda' | 'vegetativo' | 'floração' | 'secagem' | 'cura';

export interface StrainInfo {
  name: string;
  breeder: string;
  genetics: CannabisGenetics;
  floweringType: FloweringType;
  thcMin: number; // %
  thcMax: number; // %
  floweringDays: number;
  autoflowerDays?: number; // seed to harvest for autos
  height: string;
  yield: string;
  difficulty: 'fácil' | 'média' | 'difícil';
  effects: string[];
  flavors: string[];
  emoji: string;
  description: string;
}

export interface CannabisPlanting {
  id: string;
  strainName: string;
  genetics: CannabisGenetics;
  floweringType: FloweringType;
  seedDate: string; // quando germinou/plantou a semente
  // dates for each stage (null if not reached yet)
  vegetativeDate: string | null;
  floweringDate: string | null;
  harvestDate: string | null;
  // calculated expected dates
  expectedFloweringDate: string | null;
  expectedHarvestDate: string | null;
  // metadata
  floweringDays: number; // expected flowering time
  currentStage: GrowthStage;
  quantity: number; // number of plants/seeds
  notes: string;
  color: string; // color for calendar marking
}
