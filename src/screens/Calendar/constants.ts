export type { GrowthStage } from '../../types/planting';

export const STAGE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  'germinação': { icon: '🌱', label: 'Germinação', color: '#8BC34A' },
  'muda': { icon: '🌿', label: 'Muda', color: '#4CAF50' },
  'vegetativo': { icon: '☘️', label: 'Vegetativo', color: '#2196F3' },
  'floração': { icon: '🌺', label: 'Floração', color: '#E91E63' },
  'secagem': { icon: '🍂', label: 'Secagem', color: '#795548' },
  'cura': { icon: '🫙', label: 'Cura', color: '#FF9800' },
};

export const ENTRY_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  watering: { icon: '💧', label: 'Rega', color: '#0288D1' },
  nutrition: { icon: '🧪', label: 'Nutrição', color: '#2E7D32' },
  pruning: { icon: '✂️', label: 'Poda', color: '#E65100' },
  photo: { icon: '📷', label: 'Foto', color: '#7B1FA2' },
  video: { icon: '🎥', label: 'Vídeo', color: '#C2185B' },
  comment: { icon: '💬', label: 'Comentário', color: '#1565C0' },
};

export const STAGE_TO_DOT: Record<string, { key: string; color: string }> = {
  'germinação': { key: 'germinação', color: '#8BC34A' },
  'muda': { key: 'muda', color: '#4CAF50' },
  'vegetativo': { key: 'vegetativo', color: '#2196F3' },
  'floração': { key: 'floração', color: '#E91E63' },
  'secagem': { key: 'secagem', color: '#795548' },
  'cura': { key: 'cura', color: '#FF9800' },
};

export const ENTRY_TO_DOT: Record<string, { key: string; color: string }> = {
  watering: { key: 'watering', color: '#0288D1' },
  nutrition: { key: 'nutrition', color: '#2E7D32' },
  pruning: { key: 'pruning', color: '#E65100' },
  photo: { key: 'photo', color: '#7B1FA2' },
  video: { key: 'video', color: '#C2185B' },
  comment: { key: 'comment', color: '#1565C0' },
};

export const LEGEND_ITEMS = [
  { icon: '🌱', label: 'Germinação', color: '#8BC34A' },
  { icon: '🌿', label: 'Muda', color: '#4CAF50' },
  { icon: '☘️', label: 'Vegetativo', color: '#2196F3' },
  { icon: '🌺', label: 'Floração', color: '#E91E63' },
  { icon: '🍂', label: 'Secagem', color: '#795548' },
  { icon: '🫙', label: 'Cura', color: '#FF9800' },
  { icon: '💧', label: 'Rega', color: '#0288D1' },
  { icon: '✂️', label: 'Poda', color: '#E65100' },
  { icon: '🧪', label: 'Nutrição', color: '#2E7D32' },
  { icon: '📷', label: 'Foto', color: '#7B1FA2' },
  { icon: '💬', label: 'Comentário', color: '#1565C0' },
];
