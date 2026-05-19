import { format, differenceInDays, addDays, parseISO, isValid, isBefore, isAfter, startOfDay, isToday as isTodayFn } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { GrowthStage, FloweringType } from '../types/planting';

/** Format date to DD/MM/YYYY */
export const formatDate = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

/** Format date to "15 de maio de 2026" */
export const formatDateLong = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

/** Days from today (positive = future, negative = past) */
export const daysRemaining = (dateStr: string): number => {
  const date = parseISO(dateStr);
  if (!isValid(date)) return 0;
  return differenceInDays(date, startOfDay(new Date()));
};

/** Add days to a date string */
export const addDaysToDate = (dateStr: string, days: number): string =>
  format(addDays(parseISO(dateStr), days), 'yyyy-MM-dd');

export const isPast = (dateStr: string): boolean => {
  const d = parseISO(dateStr);
  return isValid(d) && isBefore(d, startOfDay(new Date()));
};

export const isFutureDate = (dateStr: string): boolean => {
  const d = parseISO(dateStr);
  return isValid(d) && isAfter(d, startOfDay(new Date()));
};

export const isToday = (dateStr: string): boolean => isTodayFn(parseISO(dateStr));

/** Status label for a date */
export const dateStatus = (dateStr: string, label: string): string => {
  const days = daysRemaining(dateStr);
  if (days < 0) return `✓ ${label} realizado(a)`;
  if (days === 0) return `📍 ${label} hoje!`;
  if (days === 1) return `⚠️ ${label} amanhã`;
  if (days <= 7) return `⚠️ ${days} dias para ${label.toLowerCase()}`;
  return `${days} dias para ${label.toLowerCase()}`;
};

export const toCalendarDate = (date: Date): string => format(date, 'yyyy-MM-dd');

// ---- Cannabis growth stage calculations ----

/**
 * Calculate current growth stage based on seed date and optionally flowering date.
 * Cannabis stages:
 *   Germinação:  0-7 dias
 *   Muda:        7-21 dias
 *   Vegetativo:  21 dias até switch para 12/12 (ou ~30 dias para auto)
 *   Floração:    após switch (fotoperíodo) ou ~30+ dias (auto)
 *   Secagem:     na data de colheita
 *   Cura:        pós-colheita (14-21 dias)
 */
export const calculateStage = (
  seedDate: string,
  floweringDate: string | null,
  harvestDate: string | null,
  floweringDays: number,
  floweringType: FloweringType = 'photoperiodic',
): GrowthStage => {
  const daysSinceSeed = daysRemaining(seedDate) * -1; // days that have passed

  if (daysSinceSeed < 0) {
    return 'germinação';
  }

  if (daysSinceSeed <= 7) return 'germinação';
  if (daysSinceSeed <= 21) return 'muda';

  // If harvest date passed
  if (harvestDate && isPast(harvestDate)) {
    const daysAfterHarvest = daysRemaining(harvestDate) * -1;
    if (daysAfterHarvest <= 14) return 'secagem';
    if (daysAfterHarvest <= 35) return 'cura';
    return 'germinação'; // beyond cure, back to germinação to indicate completed
  }

  if (harvestDate && isToday(harvestDate)) return 'secagem';

  // If flowering started
  if (floweringDate) {
    return 'floração';
  }

  // Still in veg (pre-flower switch)
  return 'vegetativo';
};

/** Stage icon for UI */
export const stageIcon = (stage: GrowthStage): string => {
  const icons: Record<GrowthStage, string> = {
    'germinação': '🌱',
    'muda': '🌿',
    'vegetativo': '☘️',
    'floração': '🌺',
    'secagem': '🍂',
    'cura': '🫙',
  };
  return icons[stage] ?? '🌱';
};

/** Stage color for UI */
export const stageColor = (stage: GrowthStage): string => {
  const colors: Record<GrowthStage, string> = {
    'germinação': '#8BC34A',
    'muda': '#4CAF50',
    'vegetativo': '#2196F3',
    'floração': '#E91E63',
    'secagem': '#795548',
    'cura': '#FF9800',
  };
  return colors[stage] ?? '#999';
};

/** Stage label (capitalized) */
export const stageLabel = (stage: GrowthStage): string => {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
};

/** Calculate days in current stage */
export const daysInStage = (seedDate: string, floweringDate: string | null): number => {
  const startDate = floweringDate ? parseISO(floweringDate) : parseISO(seedDate);
  if (!isValid(startDate)) return 0;
  const days = differenceInDays(new Date(), startDate);
  return days >= 0 ? days : 0;
};

/** Progress percentage for current stage (0-100) */
export const stageProgress = (
  stage: GrowthStage,
  seedDate: string,
  floweringDate: string | null,
  floweringDays: number,
  harvestDate?: string | null,
): number => {
  const daysSinceSeed = daysRemaining(seedDate) * -1;

  switch (stage) {
    case 'germinação':
      return Math.min(100, (daysSinceSeed / 7) * 100);
    case 'muda':
      return Math.min(100, ((daysSinceSeed - 7) / 14) * 100);
    case 'vegetativo': {
      if (floweringDate) return 100;
      const expectedVeg = 30;
      return Math.min(100, ((daysSinceSeed - 21) / expectedVeg) * 100);
    }
    case 'floração': {
      if (!floweringDate) return 0;
      const daysSinceFlower = daysRemaining(floweringDate) * -1;
      return Math.min(100, (daysSinceFlower / floweringDays) * 100);
    }
    case 'secagem':
      return 100;
    case 'cura': {
      if (!harvestDate) return 0;
      const daysAfterHarvest = daysRemaining(harvestDate) * -1;
      return Math.min(100, (daysAfterHarvest / 21) * 100);
    }
    default:
      return 0;
  }
};
