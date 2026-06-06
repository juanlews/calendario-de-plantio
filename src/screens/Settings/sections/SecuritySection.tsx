import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../context/SettingsContext';
import { SettingRow, SectionGroup, Divider } from '../components';

interface SecuritySectionProps {
  theme: any;
  onEncryptionPress: () => void;
  onAuthPress: () => void;
  encryptionReady: boolean;
  encryptionBusy: boolean;
  authReady: boolean;
  authBusy: boolean;
  encryptData: boolean;
  requireAuth: boolean;
}

/**
 * Seção de Segurança: criptografia de dados e autenticação biométrica/PIN.
 */
export const SecuritySection: React.FC<SecuritySectionProps> = ({
  theme,
  onEncryptionPress,
  onAuthPress,
  encryptionReady,
  encryptionBusy,
  authReady,
  authBusy,
  encryptData,
  requireAuth,
}) => {
  const { t } = useTranslation();

  return (
    <SectionGroup title={t('settings.sectionSecurity')} theme={theme}>
      <SettingRow
        label={t('settings.encryptData')}
        value={encryptData ? t('settings.enabled') : t('settings.disabled')}
        onPress={onEncryptionPress}
        theme={theme}
        disabled={!encryptionReady || encryptionBusy}
      />

      <Divider theme={theme} />

      <SettingRow
        label={t('settings.requireAuth')}
        value={requireAuth ? t('settings.enabled') : t('settings.disabled')}
        onPress={onAuthPress}
        theme={theme}
        disabled={!authReady || authBusy}
      />
    </SectionGroup>
  );
};