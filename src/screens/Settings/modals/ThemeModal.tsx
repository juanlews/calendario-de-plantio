import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../context/SettingsContext';
import { useThemeCtx, staticLightTheme, staticDarkTheme } from '../../../theme/ThemeProvider';
import { SelectionModal } from '../components';
import ColorBall from '../../../components/ColorBall';
import { themeOptions } from '../constants';
import { styles } from '../styles';
import { useColorScheme } from 'react-native';
import type { MD3Theme } from 'react-native-paper';

interface ThemeModalProps {
  visible: boolean;
  theme: any;
  onClose: () => void;
}

/**
 * Modal para seleção de tema (claro, escuro, sistema).
 * Cada opção mostra preview do ColorBall com cores do tema correspondente.
 */
export const ThemeModal: React.FC<ThemeModalProps> = ({
  visible,
  theme,
  onClose,
}) => {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();
  const { themeMode } = useThemeCtx();
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'dynamic' && systemScheme === 'dark');

  return (
    <SelectionModal
      visible={visible}
      title={t('settings.theme')}
      onCancel={onClose}
      cancelLabel={t('journal.cancelBtn')}
      theme={theme}
    >
      {themeOptions.map((opt) => {
        let previewColors: MD3Theme['colors'];
        let previewIsDark = false;

        switch (opt.key) {
          case 'dark':
            previewColors = staticDarkTheme.colors;
            previewIsDark = true;
            break;
          case 'dynamic':
            previewColors = isDark ? staticDarkTheme.colors : staticLightTheme.colors;
            previewIsDark = isDark;
            break;
          default:
            previewColors = staticLightTheme.colors;
            previewIsDark = false;
        }

        const isSelected = settings.themeMode === opt.key;

        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.modalOption,
              isSelected && { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 },
            ]}
            onPress={() => {
              updateSettings({ themeMode: opt.key });
              onClose();
            }}
          >
            <View style={styles.modalOptionIcon}>
              <Ionicons
                name={opt.icon as any}
                size={22}
                color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            </View>
            <View style={styles.modalOptionTextWrap}>
              <Text
                style={[
                  styles.modalOptionText,
                  { color: theme.colors.onSurface },
                  isSelected && { color: theme.colors.primary, fontWeight: '600' },
                ]}
              >
                {t(opt.labelKey)}
              </Text>
              <Text style={[styles.modalOptionDesc, { color: theme.colors.onSurfaceVariant }]}>
                {t(opt.descKey)}
              </Text>
            </View>
            <View style={styles.modalOptionColorBall}>
              <ColorBall size={32} themeColors={previewColors} isDark={previewIsDark} />
            </View>
            {isSelected && (
              <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </SelectionModal>
  );
};