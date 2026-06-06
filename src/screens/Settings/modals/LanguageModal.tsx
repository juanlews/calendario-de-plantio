import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SelectionModal } from '../components';
import { languageOptions } from '../constants';
import { styles } from '../styles';

interface LanguageModalProps {
  visible: boolean;
  theme: any;
  onClose: () => void;
}

/**
 * Modal para seleção de idioma (PT/EN).
 * Aplica mudança imediata via i18n.changeLanguage().
 */
export const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  theme,
  onClose,
}) => {
  const { i18n, t } = useTranslation();

  return (
    <SelectionModal
      visible={visible}
      title={t('settings.language')}
      onCancel={onClose}
      cancelLabel={t('journal.cancelBtn')}
      theme={theme}
    >
      {languageOptions.map((opt) => {
        const isSelected = i18n.language === opt.key;

        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.modalOption,
              isSelected && { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 },
            ]}
            onPress={() => {
              i18n.changeLanguage(opt.key);
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
              {t(opt.labelKey)}
            </Text>
            {isSelected && (
              <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </SelectionModal>
  );
};