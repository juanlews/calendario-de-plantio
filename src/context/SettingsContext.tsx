import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { AppSettings, DateFormat, TimeFormat } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { loadSettings, saveSettings } from '../data/settingsStorage';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  /** Format a date string for display using current dateFormat setting */
  formatDate: (dateStr: string) => string;
  /** Format a time string for display using current timeFormat setting */
  formatTime: (isoTimestamp: string) => string;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const formatDate = useCallback(
    (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      switch (settings.dateFormat) {
        case 'MM/DD/YYYY':
          return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        default:
          return `${day}/${month}/${year}`;
      }
    },
    [settings.dateFormat],
  );

  const formatTime = useCallback(
    (isoTimestamp: string) => {
      const date = new Date(isoTimestamp);
      if (isNaN(date.getTime())) return '';
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      if (settings.timeFormat === 'HH:mm:ss') {
        return `${h}:${m}:${s}`;
      }
      return `${h}:${m}`;
    },
    [settings.timeFormat],
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      formatDate,
      formatTime,
    }),
    [settings, updateSettings, formatDate, formatTime],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
