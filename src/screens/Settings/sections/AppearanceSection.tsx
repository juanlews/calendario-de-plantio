import React from 'react';
import { View, Text, Platform, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeCtx } from '../../../theme/ThemeProvider';
import { useSettings } from '../../../context/SettingsContext';
import { SettingRow, SectionGroup, Divider } from '../components';
import ColorBall from '../../../components/ColorBall';
import { themeOptions } from '../constants';
import { styles } from '../styles';

interface AppearanceSectionProps {
  theme: any;
  onThemePress: () => void;
}

/**
 * Seção de Aparência: permite alterar o tema (claro, escuro, sistema).
 * Mostra informação adicional quando tema é "dynamic" (sistema).
 */
export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  theme,
  onThemePress,
}) => {
  const { themeMode } = useThemeCtx();
  const { settings } = useSettings();
  const { t } = useTranslation();
  const systemScheme = useColorScheme();

  const isDark = themeMode === 'dark' || (themeMode === 'dynamic' && systemScheme === 'dark');

  const currentThemeOpt = themeOptions.find((o) => o.key === settings.themeMode);
  const currentThemeLabel = currentThemeOpt ? t(currentThemeOpt.labelKey) : '';

  return (
    <SectionGroup title={t('settings.sectionAppearance')} theme={theme}>
      <SettingRow
        label={t('settings.theme')}
        value={currentThemeLabel}
        onPress={onThemePress}
        theme={theme}
        rightElement={<ColorBall size={36} />}
      />

      {settings.themeMode === 'dynamic' && (
        <>
          <Divider theme={theme} />
          <View style={[
            styles.infoRow,
            { backgroundColor: isDark ? theme.colors.surfaceVariant : '#E3F2FD' }
          ]}>
            <Ionicons
              name="information-circle"
              size={16}
              color={isDark ? theme.colors.primary : '#2196F3'}
            />
            <Text style={[
              styles.infoText,
              { color: isDark ? theme.colors.onSurfaceVariant : '#1565C0' }
            ]}>
              {t('settings.themeSystem')}
            </Text>
          </View>
        </>
      )}
    </SectionGroup>
  );
};