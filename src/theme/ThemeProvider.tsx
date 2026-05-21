/**
 * Theme Provider — integra React Native Paper com Material You.
 *
 * Modos:
 *   light    → tema claro estático
 *   dark     → tema escuro estático
 *   dynamic  → Material You (Android 12+ lê wallpaper; iOS/web usa seed color)
 *
 * Usa react-native-dynamic-theme (FouadMagdy01).
 * No Android 12+: lê cores reais do wallpaper.
 * Fora disso: gera esquema a partir da seed color configurada.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, useColorScheme } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { useSettings } from '../context/SettingsContext';
import type { AppThemeMode } from '../types/settings';
import { lightColors, darkColors, MATERIAL_SEED } from './colors';

// ─── Dynamic colors (react-native-dynamic-theme) ─────────────
let getDynamicColorScheme:
  | ((fallbackColor?: string) => {
      light: Record<string, string>;
      dark: Record<string, string>;
    })
  | undefined;

let getExtendedDynamicSchemeFromSourceColor:
  | ((sourceColor: string) => {
      light: Record<string, string>;
      dark: Record<string, string>;
    })
  | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('react-native-dynamic-theme');
  if (mod?.getDynamicColorScheme) {
    getDynamicColorScheme = mod.getDynamicColorScheme;
  }
  if (mod?.getExtendedDynamicSchemeFromSourceColor) {
    getExtendedDynamicSchemeFromSourceColor = mod.getExtendedDynamicSchemeFromSourceColor;
  }
} catch {
  // Not available — will use fallback
}

// ─── Build Paper themes ───────────────────────────────────────
function buildLightTheme(): MD3Theme {
  return {
    ...MD3LightTheme,
    colors: { ...MD3LightTheme.colors, ...lightColors },
  };
}

function buildDarkTheme(): MD3Theme {
  return {
    ...MD3DarkTheme,
    colors: { ...MD3DarkTheme.colors, ...darkColors },
  };
}

/** Merge dynamic color tokens into an MD3 theme object */
function applyDynamicColors(base: MD3Theme, dyn: Record<string, string>): MD3Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: dyn.primary ?? base.colors.primary,
      onPrimary: dyn.onPrimary ?? base.colors.onPrimary,
      primaryContainer: dyn.primaryContainer ?? base.colors.primaryContainer,
      onPrimaryContainer:
        dyn.onPrimaryContainer ?? base.colors.onPrimaryContainer,
      secondary: dyn.secondary ?? base.colors.secondary,
      onSecondary: dyn.onSecondary ?? base.colors.onSecondary,
      secondaryContainer:
        dyn.secondaryContainer ?? base.colors.secondaryContainer,
      onSecondaryContainer:
        dyn.onSecondaryContainer ?? base.colors.onSecondaryContainer,
      tertiary: dyn.tertiary ?? base.colors.tertiary,
      onTertiary: dyn.onTertiary ?? base.colors.onTertiary,
      tertiaryContainer: dyn.tertiaryContainer ?? base.colors.tertiaryContainer,
      onTertiaryContainer:
        dyn.onTertiaryContainer ?? base.colors.onTertiaryContainer,
      surface: dyn.surface ?? base.colors.surface,
      onSurface: dyn.onSurface ?? base.colors.onSurface,
      surfaceVariant: dyn.surfaceVariant ?? base.colors.surfaceVariant,
      onSurfaceVariant: dyn.onSurfaceVariant ?? base.colors.onSurfaceVariant,
      background: dyn.background ?? base.colors.background,
      onBackground: dyn.onBackground ?? base.colors.onBackground,
      error: dyn.error ?? base.colors.error,
      onError: dyn.onError ?? base.colors.onError,
      outline: dyn.outline ?? base.colors.outline,
      outlineVariant: dyn.outlineVariant ?? base.colors.outlineVariant,
      inverseSurface: dyn.inverseSurface ?? base.colors.inverseSurface,
      inverseOnSurface: dyn.inverseOnSurface ?? base.colors.inverseOnSurface,
      inversePrimary: dyn.inversePrimary ?? base.colors.inversePrimary,
      scrim: dyn.scrim ?? base.colors.scrim,
      shadow: dyn.shadow ?? base.colors.shadow,
      backdrop: dyn.backdrop ?? base.colors.backdrop,
      surfaceDisabled: dyn.surfaceDisabled ?? base.colors.surfaceDisabled,
      onSurfaceDisabled: dyn.onSurfaceDisabled ?? base.colors.onSurfaceDisabled,
      elevation: {
        level0:
          (dyn as any).elevation?.level0 ?? base.colors.elevation.level0,
        level1:
          (dyn as any).elevation?.level1 ?? base.colors.elevation.level1,
        level2:
          (dyn as any).elevation?.level2 ?? base.colors.elevation.level2,
        level3:
          (dyn as any).elevation?.level3 ?? base.colors.elevation.level3,
        level4:
          (dyn as any).elevation?.level4 ?? base.colors.elevation.level4,
        level5:
          (dyn as any).elevation?.level5 ?? base.colors.elevation.level5,
      },
    },
  };
}

function buildThemeFromSeed(
  seedColor: string,
  isDark: boolean
): MD3Theme {
  const generator = getExtendedDynamicSchemeFromSourceColor;
  const base = isDark ? MD3DarkTheme : MD3LightTheme;

  if (generator) {
    try {
      const scheme = generator(seedColor);
      const variant = isDark ? scheme.dark : scheme.light;
      return applyDynamicColors(base, variant);
    } catch {
      // fall through to manual mapping
    }
  }

  // Manual mapping fallback (MD3 tonal positions for seed)
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: seedColor,
      primaryContainer: isDark ? '#1B5E20' : '#C8E6C9',
      secondary: isDark ? '#AED581' : '#7CB342',
      secondaryContainer: isDark ? '#33691E' : '#DCEDC8',
      tertiary: isDark ? '#4DB6AC' : '#26A69A',
      tertiaryContainer: isDark ? '#004D40' : '#B2DFDB',
    },
  };
}

// ─── Context ──────────────────────────────────────────────────
interface ThemeContextValue {
  themeMode: AppThemeMode;
  theme: MD3Theme;
  isDark: boolean;
  /** Cor seed atual do Material You (pode ser trocada pelo usuário) */
  seedColor: string;
  setSeedColor: (color: string) => void;
  /** Cores primárias extraídas do esquema atual (para o color ball) */
  primaryColors: string[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useThemeCtx = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeCtx must be used within ThemeProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useSettings();
  const systemScheme = useColorScheme();

  /** Seed color configurável (default = MATERIAL_SEED) */
  const [seedColor, setSeedColor] = useState(MATERIAL_SEED);

  /** Cores do dispositivo — Android 12+ lê wallpaper, outros usam seed */
  const [deviceScheme, setDeviceScheme] = useState<{
    light: Record<string, string>;
    dark: Record<string, string>;
  } | null>(null);

  const appState = useRef(AppState.currentState);

  const fetchDynamic = useCallback(() => {
    if (!getDynamicColorScheme) return;
    try {
      // Com fallback: Android 12+ lê wallpaper; outros geram a partir do fallback.
      const result = getDynamicColorScheme(seedColor);
      if (result) {
        setDeviceScheme(result);
      }
    } catch {
      // ignore
    }
  }, [seedColor]);

  // Fetch on mount and when seed changes
  useEffect(() => {
    fetchDynamic();
  }, [fetchDynamic]);

  // Re-fetch when app comes to foreground (user may have changed wallpaper color)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        fetchDynamic();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [fetchDynamic]);

  const isDark =
    settings.themeMode === 'dark' ||
    (settings.themeMode === 'dynamic' && systemScheme === 'dark');

  const theme = useMemo(() => {
    switch (settings.themeMode) {
      case 'dark':
        return buildDarkTheme();
      case 'dynamic': {
        if (deviceScheme) {
          const variant = isDark ? deviceScheme.dark : deviceScheme.light;
          const base = isDark ? MD3DarkTheme : MD3LightTheme;
          return applyDynamicColors(base, variant);
        }
        return buildThemeFromSeed(seedColor, isDark);
      }
      default:
        return buildLightTheme();
    }
  }, [settings.themeMode, deviceScheme, isDark, seedColor]);

  // Extrai cores do esquema atual para o color ball
  const primaryColors = useMemo(() => {
    const c = theme.colors;
    return [
      c.primary,
      c.primaryContainer,
      c.secondary,
      c.secondaryContainer,
      c.tertiary,
      c.tertiaryContainer,
    ];
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode: settings.themeMode,
        theme,
        isDark,
        seedColor,
        setSeedColor,
        primaryColors,
      }}
    >
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export { lightColors, darkColors, MATERIAL_SEED };
