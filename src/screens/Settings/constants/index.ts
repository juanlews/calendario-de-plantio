import type { DateFormat, TimeFormat, AppThemeMode } from '../../../types/settings';

/** Opções de tema disponíveis */
export const themeOptions: {
  key: AppThemeMode;
  labelKey: string;
  icon: string;
  descKey: string;
}[] = [
  { key: 'light', labelKey: 'settings.themeLight', icon: 'sunny', descKey: 'settings.themeLight' },
  { key: 'dark', labelKey: 'settings.themeDark', icon: 'moon', descKey: 'settings.themeDark' },
  { key: 'dynamic', labelKey: 'settings.themeSystem', icon: 'color-palette', descKey: 'settings.themeSystem' },
];

/** Idiomas suportados */
export const languageOptions: { key: string; labelKey: string }[] = [
  { key: 'pt', labelKey: 'settings.languagePt' },
  { key: 'en', labelKey: 'settings.languageEn' },
];

/** Formatos de data disponíveis */
export const dateFormatOptions: { key: DateFormat; label: string; example: string }[] = [
  { key: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '20/05/2026' },
  { key: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '05/20/2026' },
  { key: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-05-20' },
];

/** Formatos de hora disponíveis */
export const timeFormatOptions: { key: TimeFormat; label: string; example: string }[] = [
  { key: 'HH:mm', label: '24h', example: '14:30' },
  { key: 'HH:mm:ss', label: '24h', example: '14:30:00' },
];