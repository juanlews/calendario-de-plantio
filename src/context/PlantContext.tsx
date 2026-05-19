import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { loadPlantings, savePlantings, deletePlanting, updatePlanting as updatePlantingStorage, addPlanting as addPlantingStorage } from '../data/storage';
import type { CannabisPlanting } from '../types/planting';
import { calculateStage } from '../utils/dateUtils';

interface PlantContextValue {
  plantings: CannabisPlanting[];
  loading: boolean;
  addPlanting: (p: CannabisPlanting) => void;
  updatePlanting: (p: CannabisPlanting) => void;
  deletePlanting: (id: string) => void;
  updateStage: (id: string, floweringDate?: string, harvestDate?: string) => void;
}

const PlantContext = createContext<PlantContextValue | undefined>(undefined);

export const usePlants = (): PlantContextValue => {
  const ctx = useContext(PlantContext);
  if (!ctx) throw new Error('usePlants must be used within PlantProvider');
  return ctx;
};

export const PlantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plantings, setPlantings] = useState<CannabisPlanting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlantings().then((data) => {
      setPlantings(data);
      setLoading(false);
    });
  }, []);

  const addPlanting = useCallback((p: CannabisPlanting) => {
    addPlantingStorage(p).then(setPlantings);
  }, []);

  const updatePlanting = useCallback((p: CannabisPlanting) => {
    updatePlantingStorage(p).then(setPlantings);
  }, []);

  const deletePlantingFn = useCallback((id: string) => {
    deletePlanting(id).then(setPlantings);
  }, []);

  const updateStage = useCallback((id: string, floweringDate?: string, harvestDate?: string) => {
    setPlantings((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        let newFloweringDate = p.floweringDate;
        let newHarvestDate = p.harvestDate;
        if (floweringDate !== undefined) newFloweringDate = floweringDate || p.floweringDate;
        if (harvestDate !== undefined) newHarvestDate = harvestDate || p.harvestDate;
        const newStage = calculateStage(p.seedDate, newFloweringDate, newHarvestDate, p.floweringDays, p.floweringType);
        return { ...p, currentStage: newStage, floweringDate: newFloweringDate, harvestDate: newHarvestDate };
      });
      savePlantings(updated);
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      plantings,
      loading,
      addPlanting,
      updatePlanting,
      deletePlanting: deletePlantingFn,
      updateStage,
    }),
    [plantings, loading, addPlanting, updatePlanting, deletePlantingFn, updateStage],
  );

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
};
