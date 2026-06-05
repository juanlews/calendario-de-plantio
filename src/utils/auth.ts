import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const AUTH_ENABLED_KEY = 'app_auth_enabled_v1';
const AUTH_FALLBACK_KEY = 'app_auth_fallback_enabled_v1';

/** Check if device supports biometric authentication */
export const isBiometricAvailable = async (): Promise<{
  available: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
  error?: string;
}> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return { available: false, biometricTypes: [], error: 'No biometric hardware' };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return { available: false, biometricTypes: [], error: 'No biometrics enrolled' };
    }

    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return { available: true, biometricTypes: supportedTypes };
  } catch (error) {
    return { available: false, biometricTypes: [], error: String(error) };
  }
};

/** Authenticate user with biometrics or device credentials (PIN/pattern/password) */
export const authenticate = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentique para acessar o app',
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar PIN/padrão/senha',
      disableDeviceFallback: false, // Allow PIN/pattern/password fallback
    });

    if (result.success) {
      return { success: true };
    }
    // result.error exists only when success is false
    return { success: false, error: 'error' in result ? result.error : 'Authentication failed' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/** Check if auth is enabled in settings */
export const getAuthEnabled = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(AUTH_ENABLED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
};

/** Set auth enabled state */
export const setAuthEnabled = async (enabled: boolean): Promise<void> => {
  await SecureStore.setItemAsync(AUTH_ENABLED_KEY, String(enabled));
};

/** Check if fallback (device credentials) is enabled */
export const getFallbackEnabled = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(AUTH_FALLBACK_KEY);
    return value !== 'false'; // Default to true
  } catch {
    return true;
  }
};

/** Set fallback enabled state */
export const setFallbackEnabled = async (enabled: boolean): Promise<void> => {
  await SecureStore.setItemAsync(AUTH_FALLBACK_KEY, String(enabled));
};

/** Get human-readable biometric type name */
export const getBiometricTypeName = (type: LocalAuthentication.AuthenticationType): string => {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return 'Digital';
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return 'Face ID / Reconhecimento facial';
    case LocalAuthentication.AuthenticationType.IRIS:
      return 'Íris';
    default:
      return 'Biometria';
  }
};

/** Get all available biometric type names */
export const getAvailableBiometricNames = async (): Promise<string[]> => {
  const { biometricTypes } = await isBiometricAvailable();
  return biometricTypes.map(getBiometricTypeName);
};
