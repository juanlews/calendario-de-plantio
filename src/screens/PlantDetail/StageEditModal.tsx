import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { usePlants } from '../../context/PlantContext';
import type { GrowthStage } from '../../types/planting';
import { stageIcon, stageColor, stageLabel } from '../../utils/dateUtils';
import { styles } from './shared';

const GROWTH_STAGES: GrowthStage[] = ['germinação', 'muda', 'vegetativo', 'floração', 'secagem', 'cura'];

interface Props {
  visible: boolean;
  plantingId: string;
  currentStage: GrowthStage;
  onClose: () => void;
  theme: any;
}

export const StageEditModal: React.FC<Props> = ({ visible, plantingId, currentStage, onClose, theme }) => {
  const { updateCurrentStage } = usePlants();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Editar Estágio</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalCloseBtn, { backgroundColor: theme.colors.elevation.level2 }]}
            >
              <Text style={[styles.modalCloseText, { color: theme.colors.onSurfaceVariant }]}>✕</Text>
            </TouchableOpacity>
          </View>
          {GROWTH_STAGES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.modalStageItem,
                { borderBottomColor: theme.colors.outlineVariant },
                currentStage === s && { backgroundColor: stageColor(s) + '18', borderColor: stageColor(s) },
              ]}
              onPress={() => {
                updateCurrentStage(plantingId, s);
                onClose();
              }}
            >
              <Text style={styles.modalStageIcon}>{stageIcon(s)}</Text>
              <Text
                style={[
                  styles.modalStageLabel,
                  { color: theme.colors.onSurface },
                  currentStage === s && { color: stageColor(s), fontWeight: '700' },
                ]}
              >
                {stageLabel(s)}
              </Text>
              {currentStage === s && (
                <Text style={[styles.modalStageCheck, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};
