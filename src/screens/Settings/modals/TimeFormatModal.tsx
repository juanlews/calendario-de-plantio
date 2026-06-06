import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../context/SettingsContext';
import { SelectionModal } from '../components';
import { timeFormatOptions } from '../constants';
import { styles } from '../styles';

interface TimeFormatModalProps {
  visible: boolean;
  theme: any;
  onClose: () => void;
}

/**
 * Modal para seleção de formato de hora (HH:mm, HH:mm:ss).
 */
export const TimeFormatModal: React.FC<TimeFormatModalProps> = ({
  visible,
  theme,
  onClose,
}) => {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();

  return (
    <SelectionModal
      visible={visible}
      title={t('settings.timeFormat')}
      onCancel={onClose}
      cancelLabel={t('journal.cancelBtn')}
      theme={theme}
    >
      {timeFormatOptions.map((opt) => {
        const isSelected = settings.timeFormat === opt.key;

        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.modalOption,
              isSelected && { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 },
            ]}
            onPress={() => {
              updateSettings({ timeFormat: opt.key });
              onClose();
            }}
          >
            <Text
              style={[
                styles.modalOptionText,
                { color: theme.colors.onSurface },
                isSelected && { color: theme.colors.primary, fontWeight: '600' },
              ]}
            >
              {opt.label}
            </Text>
            <Text style={[styles.modalExample, { color: theme.colors.onSurfaceVariant }]}>{opt.example}</Text>
            {isSelected && (
              <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </SelectionModal>
  );
};