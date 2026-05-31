import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { stageIcon, stageColor, stageLabel } from '../../utils/dateUtils';
import type { GrowthStage } from '../../types/planting';
import { styles } from './shared';

const GROWTH_STAGES: GrowthStage[] = ['germinação', 'muda', 'vegetativo', 'floração', 'secagem', 'cura'];

interface Props {
  selectedStage: GrowthStage;
  onSelect: (stage: GrowthStage) => void;
  theme: any;
}

export const StageSelector: React.FC<Props> = ({ selectedStage, onSelect, theme }) => {
  if (Platform.OS === 'web') {
    const webSelectStyle: React.CSSProperties = {
      width: '100%',
      padding: '14px',
      fontSize: 16,
      borderRadius: 10,
      border: `1px solid ${theme.colors.outlineVariant}`,
      backgroundColor: theme.colors.elevation.level1,
      color: theme.colors.onSurface,
      fontFamily: 'inherit',
      appearance: 'auto',
    };
    return (
      <select
        value={selectedStage}
        onChange={(e) => onSelect(e.target.value as GrowthStage)}
        style={webSelectStyle}
      >
        {GROWTH_STAGES.map((s) => (
          <option key={s} value={s}>
            {stageIcon(s)} {stageLabel(s)}
          </option>
        ))}
      </select>
    );
  }

  return (
    <View style={styles.stageRow}>
      {GROWTH_STAGES.map((s) => (
        <TouchableOpacity
          key={s}
          style={[
            styles.stageBtn,
            {
              backgroundColor: theme.colors.elevation.level1,
              borderColor: theme.colors.outlineVariant,
            },
            selectedStage === s && {
              backgroundColor: stageColor(s) + '22',
              borderColor: stageColor(s),
            },
          ]}
          onPress={() => onSelect(s)}
        >
          <Text style={styles.stageIcon}>{stageIcon(s)}</Text>
          <Text
            style={[
              styles.stageBtnText,
              { color: theme.colors.onSurfaceVariant },
              selectedStage === s && { color: stageColor(s), fontWeight: '700' },
            ]}
          >
            {stageLabel(s)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
