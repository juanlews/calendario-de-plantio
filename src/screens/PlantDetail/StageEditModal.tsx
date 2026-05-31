import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { usePlants } from '../../context/PlantContext';
import { addJournalEntry, createJournalEntry } from '../../data/journalStorage';
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
  const [pendingStage, setPendingStage] = useState<GrowthStage | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!pendingStage || pendingStage === currentStage) {
      setPendingStage(null);
      onClose();
      return;
    }
    setSaving(true);
    try {
      // Update plant stage
      updateCurrentStage(plantingId, pendingStage);
      // Create journal entry
      const entry = createJournalEntry(plantingId, 'stage_change', {
        stageChange: { from: currentStage, to: pendingStage },
        note: `Estágio alterado: ${stageLabel(currentStage)} → ${stageLabel(pendingStage)}`,
      });
      await addJournalEntry(entry);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a mudança de estágio.');
    }
    setSaving(false);
    setPendingStage(null);
    onClose();
  };

  const handleClose = () => {
    setPendingStage(null);
    onClose();
  };

  const selectedStage = pendingStage ?? currentStage;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Editar Estágio</Text>
            <TouchableOpacity
              onPress={handleClose}
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
                selectedStage === s && { backgroundColor: stageColor(s) + '18', borderColor: stageColor(s) },
              ]}
              onPress={() => setPendingStage(s)}
            >
              <Text style={styles.modalStageIcon}>{stageIcon(s)}</Text>
              <Text
                style={[
                  styles.modalStageLabel,
                  { color: theme.colors.onSurface },
                  selectedStage === s && { color: stageColor(s), fontWeight: '700' },
                ]}
              >
                {stageLabel(s)}
              </Text>
              {selectedStage === s && (
                <Text style={[styles.modalStageCheck, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.modalSaveBtn,
              { backgroundColor: theme.colors.primary, opacity: (!pendingStage || pendingStage === currentStage) ? 0.5 : 1 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={[styles.modalSaveText, { color: theme.colors.onPrimary }]}>
                {pendingStage && pendingStage !== currentStage ? 'Salvar e registrar' : 'Fechar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
