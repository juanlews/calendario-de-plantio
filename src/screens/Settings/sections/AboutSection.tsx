import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useUpdateCheck } from '../../../hooks/useUpdateCheck';
import { SettingRow, SectionGroup } from '../components';
import { styles } from '../styles';

interface AboutSectionProps {
  theme: any;
  onCheckUpdates: () => void;
  checking: boolean;
}

/**
 * Seção Sobre: versão do app e verificação de atualizações.
 */
export const AboutSection: React.FC<AboutSectionProps> = ({
  theme,
  onCheckUpdates,
  checking,
}) => {
  const { t } = useTranslation();
  const { updateInfo } = useUpdateCheck();

  const currentVersion = Constants.expoConfig?.version || Constants.manifest?.version || '0.0.0';
  const versionLabel = `v${currentVersion}`;

  return (
    <SectionGroup title={t('settings.sectionAbout')} theme={theme}>
      <SettingRow
        label={t('settings.appVersion')}
        value={versionLabel}
        onPress={onCheckUpdates}
        theme={theme}
        disabled={checking}
        loading={checking}
      />

      {/* Indicador de status de atualização */}
      {updateInfo && !checking && (
        <View style={styles.updateStatus}>
          {updateInfo.hasUpdate ? (
            <Text style={[styles.updateAvailable, { color: theme.colors.error }]}>
              {t('update.availableDesc')} {updateInfo.latestVersion}
            </Text>
          ) : (
            <Text style={[styles.updateAvailable, { color: theme.colors.tertiary }]}>
              {t('update.noUpdate')}
            </Text>
          )}
        </View>
      )}
    </SectionGroup>
  );
};