import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { CannabisPlanting } from '../../types/planting';
import { stageIcon, stageColor, stageLabel } from '../../utils/dateUtils';
import { geneticsColor, styles } from './shared';

interface Props {
  planting: CannabisPlanting;
  displayName: string;
  daysSinceSeed: number;
  strainThc: string;
  onEditStage: () => void;
  onDelete: () => void;
  theme: any;
}

export const PlantHeader: React.FC<Props> = ({
  planting, displayName, daysSinceSeed, strainThc, onEditStage, onDelete, theme,
}) => {
  const stage = planting.currentStage;

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.strainName, { color: theme.colors.onSurface }]}>{displayName}</Text>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: geneticsColor(planting.genetics) }]}>
          <Text style={styles.badgeText}>{planting.genetics.toUpperCase()}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: planting.floweringType === 'autoflower' ? '#E65100' : '#455A64' }]}>
          <Text style={styles.badgeText}>
            {planting.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}
          </Text>
        </View>
        <View style={[styles.badge, styles.badgeStage, { borderColor: stageColor(stage), backgroundColor: stageColor(stage) + '18' }]}>
          <Text style={[styles.badgeText, { color: stageColor(stage) }]}>
            {stageIcon(stage)} {stageLabel(stage)}
          </Text>
        </View>
        <TouchableOpacity onPress={onEditStage} style={styles.editStageBtn}>
          <Text style={styles.editStageBtnText}>✏️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
