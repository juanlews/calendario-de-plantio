import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO, isValid } from 'date-fns';
import { usePlants } from '../../context/PlantContext';
import { addJournalEntry, createJournalEntry } from '../../data/journalStorage';
import type { GrowthStage } from '../../types/planting';
import { stageIcon, stageColor, stageLabel } from '../../utils/dateUtils';
import { styles } from './shared';

const GROWTH_STAGES: GrowthStage[] = ['germinação', 'muda', 'vegetativo', 'floração', 'secagem', 'cura'];

interface Props {
  visible: boolean;
  plantingId: string;
  seedDate: string;
  currentStage: GrowthStage;
  onClose: () => void;
  theme: any;
}

export const StageEditModal: React.FC<Props> = ({ visible, plantingId, seedDate, currentStage, onClose, theme }) => {
  const { updateCurrentStage } = usePlants();
  const { t } = useTranslation();
  const [pendingStage, setPendingStage] = useState<GrowthStage | null>(null);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const seedDateParsed = parseISO(seedDate);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const minDate = isValid(seedDateParsed) ? seedDateParsed : new Date();
  const maxDate = new Date();

  // Display date for the picker label
  const displayDate = pendingDate
    ? format(parseISO(pendingDate), 'dd/MM/yyyy')
    : todayStr.split('-').reverse().join('/');

  const handleSave = async () => {
    if (!pendingStage || pendingStage === currentStage) {
      setPendingStage(null);
      setPendingDate(null);
      onClose();
      return;
    }
    setSaving(true);
    try {
      const effectiveDate = pendingDate || todayStr;
      // Update plant stage with the chosen date
      updateCurrentStage(plantingId, pendingStage, effectiveDate);
      // Create journal entry with the effective date
      const entry = createJournalEntry(plantingId, 'stage_change', {
        stageChange: { from: currentStage, to: pendingStage },
        note: `Estágio alterado: ${stageLabel(currentStage)} → ${stageLabel(pendingStage)} (${effectiveDate.split('-').reverse().join('/')})`,
        timestamp: `${effectiveDate}T12:00:00`,
      });
      await addJournalEntry(entry);
    } catch (e) {
      Alert.alert(t('journal.validationPhoto'), t('plantDetail.comingSoon'));
    }
    setSaving(false);
    setPendingStage(null);
    setPendingDate(null);
    onClose();
  };

  const handleClose = () => {
    setPendingStage(null);
    setPendingDate(null);
    setShowDatePicker(false);
    onClose();
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setPendingDate(dateStr);
    }
  };

  const selectedStage = pendingStage ?? currentStage;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>{t('plantDetail.stageEditTitle')}</Text>
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

          {/* ─── Date Picker Section ─── */}
          {pendingStage && pendingStage !== currentStage && (
            <View style={{ marginHorizontal: 16, marginTop: 12 }}>
              <Text style={[styles.modalDateLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('plantDetail.changeDateLabel')}
              </Text>
              <TouchableOpacity
                style={[{ borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.elevation.level1, borderWidth: 1, borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.modalDateBtnText, { color: theme.colors.onSurface }]}>
                  {displayDate}
                </Text>
                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>📆</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={pendingDate ? parseISO(pendingDate) : maxDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                />
              )}
            </View>
          )}

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
                {pendingStage && pendingStage !== currentStage ? t('plantDetail.saveAndRegister') : t('plantDetail.close')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
