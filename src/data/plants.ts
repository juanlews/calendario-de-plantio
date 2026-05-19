// Dados de plantas com épocas de plantio e colheita típicas no Brasil
export interface PlantInfo {
  name: string;
  emoji: string;
  cycleDays: number;
  bestMonths: number[]; // meses recomendados para plantio (1-12)
  color: string;
}

export const plantDatabase: PlantInfo[] = [
  { name: 'Tomate', emoji: '🍅', cycleDays: 90, bestMonths: [1, 2, 8, 9, 10, 11, 12], color: '#e74c3c' },
  { name: 'Alface', emoji: '🥬', cycleDays: 30, bestMonths: [1, 2, 3, 4, 8, 9, 10, 11, 12], color: '#2ecc71' },
  { name: 'Cenoura', emoji: '🥕', cycleDays: 100, bestMonths: [2, 3, 4, 5, 6, 7, 8], color: '#e67e22' },
  { name: 'Pepino', emoji: '🥒', cycleDays: 60, bestMonths: [9, 10, 11, 12, 1, 2], color: '#27ae60' },
  { name: 'Pimenta', emoji: '🌶️', cycleDays: 120, bestMonths: [9, 10, 11, 12, 1, 2], color: '#c0392b' },
  { name: 'Feijão', emoji: '🫘', cycleDays: 80, bestMonths: [1, 2, 3, 4, 9, 10, 11, 12], color: '#8b4513' },
  { name: 'Milho', emoji: '🌽', cycleDays: 110, bestMonths: [9, 10, 11, 12, 1, 2, 3], color: '#f39c12' },
  { name: 'Abóbora', emoji: '🎃', cycleDays: 120, bestMonths: [9, 10, 11, 12, 1, 2], color: '#d35400' },
  { name: 'Cebola', emoji: '🧅', cycleDays: 150, bestMonths: [3, 4, 5, 6, 7, 8, 9], color: '#8e44ad' },
  { name: 'Batata', emoji: '🥔', cycleDays: 90, bestMonths: [2, 3, 4, 7, 8, 9], color: '#bdc3c7' },
  { name: 'Couve', emoji: '🥦', cycleDays: 60, bestMonths: [1, 2, 3, 4, 8, 9, 10, 11, 12], color: '#1abc9c' },
  { name: 'Beterraba', emoji: '🟣', cycleDays: 70, bestMonths: [2, 3, 4, 5, 6, 7, 8, 9], color: '#9b59b6' },
  { name: 'Rúcula', emoji: '🌿', cycleDays: 25, bestMonths: [1, 2, 3, 4, 8, 9, 10, 11, 12], color: '#16a085' },
  { name: 'Coentro', emoji: '🌱', cycleDays: 35, bestMonths: [1, 2, 3, 4, 5, 9, 10, 11, 12], color: '#27ae60' },
  { name: 'Salsa', emoji: '🌿', cycleDays: 40, bestMonths: [1, 2, 3, 4, 8, 9, 10, 11, 12], color: '#2ecc71' },
  { name: 'Quiabo', emoji: '🫛', cycleDays: 70, bestMonths: [9, 10, 11, 12, 1, 2], color: '#e67e22' },
  { name: 'Maxixe', emoji: '🟢', cycleDays: 50, bestMonths: [9, 10, 11, 12, 1, 2], color: '#27ae60' },
  { name: 'Berinjela', emoji: '🍆', cycleDays: 110, bestMonths: [9, 10, 11, 12, 1, 2], color: '#6c3483' },
  { name: 'Mandioca', emoji: '🫚', cycleDays: 240, bestMonths: [9, 10, 11, 12, 1, 2, 3], color: '#d4a574' },
  { name: 'Gengibre', emoji: '🫚', cycleDays: 240, bestMonths: [9, 10, 11, 12, 1, 2], color: '#d4a574' },
];

// Helper para buscar planta pelo nome
export const getPlantInfo = (name: string): PlantInfo | undefined => {
  return plantDatabase.find(p => p.name.toLowerCase() === name.toLowerCase());
};

// Verifica se o mês é bom para plantio
export const isGoodPlantingMonth = (plantName: string, month: number): boolean => {
  const info = getPlantInfo(plantName);
  if (!info) return true; // sem info = qualquer mês
  return info.bestMonths.includes(month);
};
