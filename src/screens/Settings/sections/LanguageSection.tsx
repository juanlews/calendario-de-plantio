import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../context/SettingsContext';
import { SettingRow, SectionGroup } from '../components';
import { languageOptions } from '../constants';

interface LanguageSectionProps {
  theme: any;
  onLangPress: () => void;
}

/**
 * Seção de Idioma: permite alterar o idioma do app (PT/EN).
 */
export const LanguageSection: React.FC<LanguageSectionProps> = ({
  theme,
  onLangPress,
}) => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const currentLangOpt = languageOptions.find((o) => o.key === i18n.language);
  const currentLangLabel = currentLangOpt ? t(currentLangOpt.labelKey) : t('settings.languageSystem');

  return (
    <SectionGroup title={t('settings.sectionLanguage')} theme={theme}>
      <SettingRow
        label={t('settings.language')}
        value={currentLangLabel}
        onPress={onLangPress}
        theme={theme}
      />
    </SectionGroup>
  );
};