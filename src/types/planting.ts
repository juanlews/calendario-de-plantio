export type CannabisGenetics = 'indica' | 'sativa' | 'hybrid';
export type FloweringType = 'autoflower' | 'photoperiodic';
export type GrowthStage = 'germinação' | 'muda' | 'vegetativo' | 'floração' | 'secagem' | 'cura';

// ─── Cultivation Journal ──────────────────────────────────────────────

export type JournalEntryType =
  | 'photo'       // 📷 foto com nota opcional
  | 'video'       // 🎥 vídeo com nota opcional
  | 'comment'     // 💬 comentário livre
  | 'watering'    // 💧 registro de rega
  | 'nutrition'   // 🧪 aplicação de nutrição/fertilizante
  | 'pruning';    // ✂️ registro de poda

export interface WateringData {
  volumeMl?: number;
  ph?: number;
  method?: string; // 'drip' | 'hand' | 'flood' | etc
  runoff?: boolean;
}

export interface NutritionData {
  product: string;
  doseMlPerL: number;
  ph?: number;
  ec?: number;
  type?: string; // 'veg' | 'bloom' | 'pk' | 'micro' | etc
}

export interface PruningData {
  method: string; // 'topping' | 'fimming' | 'lst' | 'defoliation' | 'lollipop' | etc
  details?: string;
}

export interface PlantJournalEntry {
  id: string;
  plantingId: string;
  type: JournalEntryType;
  timestamp: string; // ISO date-time
  note?: string;
  // type-specific data
  mediaUri?: string;   // foto/vídeo: URI local (expo-image-picker)
  mediaThumb?: string; // foto/vídeo: thumbnail URI
  watering?: WateringData;
  nutrition?: NutritionData;
  pruning?: PruningData;
}

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
  nickname?: string; // apelido opcional da planta
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
