import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../context/SettingsContext';
import { SettingRow, SectionGroup, Divider } from '../components';
import { dateFormatOptions, timeFormatOptions } from '../constants';
import type { DateFormat, TimeFormat } from '../../../types/settings';

interface DateTimeSectionProps {
  theme: any;
  onDatePress: () => void;
  onTimePress: () => void;
}

/**
 * Seção de Data e Hora: timezone (somente leitura por enquanto), formato de data e hora.
 */
export const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  theme,
  onDatePress,
  onTimePress,
}) => {
  const { settings } = useSettings();
  const { t } = useTranslation();

  // TODO: implementar timezone customizado quando necessário
  const timezoneLabel = settings.timezoneMode === 'auto'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || t('settings.languageSystem')
    : (settings.customTimezone || t('settings.languageSystem'));

  const dateExample = dateFormatOptions.find((o) => o.key === settings.dateFormat)?.example ?? '';
  const timeExample = timeFormatOptions.find((o) => o.key === settings.timeFormat)?.example ?? '';

  return (
    <SectionGroup title={t('settings.sectionFormats')} theme={theme}>
      <SettingRow
        label={t('settings.timezone')}
        value={timezoneLabel}
        onPress={() => {}} // placeholder para futura implementação
        badge={t('settings.languageSystem')}
        theme={theme}
      />

      <Divider theme={theme} />

      <SettingRow
        label={t('settings.dateFormat')}
        value={dateExample}
        onPress={onDatePress}
        theme={theme}
      />

      <Divider theme={theme} />

      <SettingRow
        label={t('settings.timeFormat')}
        value={timeExample}
        onPress={onTimePress}
        theme={theme}
      />
    </SectionGroup>
  );
};