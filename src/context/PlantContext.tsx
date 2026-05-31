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
  updateCurrentStage: (id: string, stage: CannabisPlanting['currentStage'], date?: string) => void;
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

  const updateCurrentStage = useCallback((id: string, stage: CannabisPlanting['currentStage'], date?: string) => {
    setPlantings((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const changes: Partial<CannabisPlanting> = { currentStage: stage };
        // Set stage date based on which stage we're moving to
        const effectiveDate = date || new Date().toISOString().split('T')[0];
        switch (stage) {
          case 'vegetativo':
            changes.vegetativeDate = effectiveDate;
            break;
          case 'floração':
            changes.floweringDate = effectiveDate;
            // If no vegetativeDate yet, set it to seedDate
            if (!p.vegetativeDate) changes.vegetativeDate = p.seedDate;
            break;
          case 'secagem':
            changes.harvestDate = effectiveDate;
            break;
          case 'cura':
            // harvestDate should already be set when entering secagem, but ensure it
            if (!p.harvestDate) changes.harvestDate = effectiveDate;
            break;
        }
        return { ...p, ...changes };
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
      updateCurrentStage,
    }),
    [plantings, loading, addPlanting, updatePlanting, deletePlantingFn, updateStage, updateCurrentStage],
  );

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
};
