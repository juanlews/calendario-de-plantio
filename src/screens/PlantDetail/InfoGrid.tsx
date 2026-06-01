import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CannabisPlanting } from '../../types/planting';
import { stageLabel } from '../../utils/dateUtils';
import { styles } from './shared';

interface Props {
  planting: CannabisPlanting;
  daysSinceSeed: number;
  strainThc: string;
  formatDate: (s: string) => string;
  theme: any;
}

export const InfoGrid: React.FC<Props> = ({ planting, daysSinceSeed, strainThc, formatDate, theme }) => {
  const { t } = useTranslation();
  const stage = planting.currentStage;

  return (
    <View style={[styles.infoGrid, { backgroundColor: theme.colors.surface }]}>
      <InfoBlock label={t('plantDetail.daysSinceSeed')} value={`${Math.max(0, daysSinceSeed)}d`} theme={theme} />
      <InfoBlock label={stageLabel(stage)} value={String(daysInStage(planting.seedDate, planting.floweringDate || undefined))} theme={theme} />
      <InfoBlock label={t('plantDetail.daysFlowering')} value={planting.floweringDays > 0 ? `${planting.floweringDays}d` : '—'} theme={theme} />
      <InfoBlock label={t('addPlanting.thc')} value={strainThc} theme={theme} />
      <InfoBlock label={t('addPlanting.yield')} value={planting.quantity > 1 ? `${planting.quantity} plantas` : '1 planta'} theme={theme} />
    </View>
  );
};

function daysInStage(seedDate: string, floweringDate?: string): number {
  const seed = new Date(seedDate);
  const now = new Date();
  const end = floweringDate ? new Date(floweringDate) : now;
  return Math.max(0, Math.floor((end.getTime() - seed.getTime()) / (1000 * 60 * 60 * 24)));
}

export const InfoBlock: React.FC<{ label: string; value: string; theme: any }> = ({ label, value, theme }) => (
  <View style={styles.infoBlock}>
    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{value}</Text>
    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
  </View>
);
