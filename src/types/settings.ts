export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = 'HH:mm' | 'HH:mm:ss';
export type TimezoneMode = 'auto' | 'custom';
export type AppThemeMode = 'light' | 'dark' | 'dynamic';

export interface AppSettings {
  timezoneMode: TimezoneMode;
  customTimezone?: string; // IANA timezone, e.g. 'America/Sao_Paulo'
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  themeMode: AppThemeMode;
}

export const DEFAULT_SETTINGS: AppSettings = {
  timezoneMode: 'auto',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  themeMode: 'light',
};
