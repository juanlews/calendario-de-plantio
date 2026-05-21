/**
 * Color tokens para os 3 modos: light, dark e dynamic (Material You).
 *
 * Material You usa cores derivadas de `getDynamicThemeColors` (pacote
 * @react-native-material-you) ou @react-native-dynamic-theme.
 * Quando não disponível (iOS, Web, Android < 12) usamos `dynamicFallback`.
 */

// ─── Material 3 seed ──────────────────────────────────────────
// Cor base do Material You. Usamos um verde para manter a identidade do app.
export const MATERIAL_SEED = '#4CAF50';

// ─── Light theme ──────────────────────────────────────────────
export const lightColors = {
  primary: '#2E7D32',
  primaryContainer: '#A5D6A7',
  secondary: '#558B2F',
  secondaryContainer: '#C5E1A5',
  tertiary: '#00695C',
  tertiaryContainer: '#80CBC4',
  surface: '#FAFAFA',
  surfaceVariant: '#E8F5E9',
  background: '#F5F5F5',
  error: '#B00020',
  errorContainer: '#FFDAD6',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1B5E20',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#33691E',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#004D40',
  onSurface: '#212121',
  onSurfaceVariant: '#555555',
  onBackground: '#212121',
  onError: '#FFFFFF',
  onErrorContainer: '#600',
  outline: '#B0BEC5',
  outlineVariant: '#E0E0E0',
  inverseSurface: '#37474F',
  inverseOnSurface: '#F5F5F5',
  inversePrimary: '#81C784',
  elevation: {
    level0: '#FAFAFA',
    level1: '#F1F8E9',
    level2: '#E8F5E9',
    level3: '#DCEDC8',
    level4: '#D7CCC8',
    level5: '#C8E6C9',
  },
  shadow: 'rgba(0, 0, 0, 0.15)',
  scrim: 'rgba(0, 0, 0, 0.3)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  // Grow app specific
  stageGerminacao: '#8BC34A',
  stageMuda: '#4CAF50',
  stageVegetativo: '#2196F3',
  stageFloracao: '#E91E63',
  stageSecagem: '#795548',
  stageCura: '#FF9800',
};

// ─── Dark theme ───────────────────────────────────────────────
export const darkColors = {
  primary: '#81C784',
  primaryContainer: '#1B5E20',
  secondary: '#AED581',
  secondaryContainer: '#33691E',
  tertiary: '#4DB6AC',
  tertiaryContainer: '#004D40',
  surface: '#121212',
  surfaceVariant: '#1E3325',
  background: '#1A1A1A',
  error: '#CF6679',
  errorContainer: '#B00020',
  onPrimary: '#1B5E20',
  onPrimaryContainer: '#A5D6A7',
  onSecondary: '#33691E',
  onSecondaryContainer: '#C5E1A5',
  onTertiary: '#004D40',
  onTertiaryContainer: '#80CBC4',
  onSurface: '#E0E0E0',
  onSurfaceVariant: '#AAAAAA',
  onBackground: '#E0E0E0',
  onError: '#000000',
  onErrorContainer: '#FFDAD6',
  outline: '#546E7A',
  outlineVariant: '#333333',
  inverseSurface: '#E0E0E0',
  inverseOnSurface: '#212121',
  inversePrimary: '#2E7D32',
  elevation: {
    level0: '#121212',
    level1: '#1E2E22',
    level2: '#223528',
    level3: '#2A3B2D',
    level4: '#2D3A30',
    level5: '#303E32',
  },
  shadow: 'rgba(0, 0, 0, 0.4)',
  scrim: 'rgba(0, 0, 0, 0.6)',
  backdrop: 'rgba(0, 0, 0, 0.7)',
  // Grow app specific
  stageGerminacao: '#689F38',
  stageMuda: '#43A047',
  stageVegetativo: '#1976D2',
  stageFloracao: '#C2185B',
  stageSecagem: '#5D4037',
  stageCura: '#F57C00',
};

// ─── Dynamic theme fallback ───────────────────────────────────
// Usado quando Material You não está disponível (iOS, Web, Android < 12)
export const dynamicFallbackColors = {
  ...lightColors,
  // Mantemos o mesmo green seed do light mas com pequenas variações
  primary: MATERIAL_SEED,
  primaryContainer: '#A5D6A7',
};

export type ColorTokens = typeof lightColors;
