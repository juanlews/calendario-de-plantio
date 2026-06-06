import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import { useTheme, MD3Theme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useSettings } from '../context/SettingsContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { LockIcon, type AuthState } from './LockIcon';
import { CannabisLeafTransition } from './CannabisLeafTransition';

interface AuthGateProps {
  children: React.ReactNode;
  onAuthenticated?: () => void;
}

interface AuthScreenProps {
  theme: MD3Theme;
  t: TFunction;
  biometricType: string;
  authState: AuthState;
  isLocked: boolean;
  authenticating: boolean;
  authError: string | null;
  onAuthenticate: () => void;
  onCancel: () => void;
}

// Tela de autenticação extraída como componente para passar como fromChildren
const AuthScreen: React.FC<AuthScreenProps> = ({
  theme,
  t,
  biometricType,
  authState,
  isLocked,
  authenticating,
  authError,
  onAuthenticate,
  onCancel,
}) => (
  <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <View style={[styles.authCard, { backgroundColor: theme.colors.surface }]}>
      <LockIcon
        locked={isLocked}
        authState={authState}
        size={64}
        color={theme.colors.primary}
        errorColor={theme.colors.error}
        loadingColor={theme.colors.tertiary}
      />
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{t('auth.authTitle')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        {biometricType
          ? t('auth.authUseBiometric', { type: biometricType })
          : t('auth.authUsePin')}
      </Text>
      {authError && (
        <Text style={[styles.error, { color: theme.colors.error }]}>{authError}</Text>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
          onPress={onAuthenticate}
          disabled={authenticating}
          activeOpacity={0.8}
        >
          <Text style={[styles.authButtonText, { color: theme.colors.onPrimary }]}>
            {authenticating ? t('auth.authAuthenticating') : t('auth.authAuthenticateBtn')}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onCancel}>
        <Text style={[styles.cancelText, { color: theme.colors.onSurfaceVariant }]}>
          {t('auth.authCancel')}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const AuthGate: React.FC<AuthGateProps> = ({ children, onAuthenticated }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { authenticate, checkAuthRequired, isAuthReady } = useSettings();
  const [showAuth, setShowAuth] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<string>('');
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [isLocked, setIsLocked] = useState(true);
  const [showLeafTransition, setShowLeafTransition] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isAuthReady) return;

      const required = await checkAuthRequired();
      if (required) {
        setShowAuth(true);
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.length > 0) {
          const type = supportedTypes[0];
          switch (type) {
            case LocalAuthentication.AuthenticationType.FINGERPRINT:
              setBiometricType('digital');
              break;
            case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
              setBiometricType('reconhecimento facial');
              break;
            case LocalAuthentication.AuthenticationType.IRIS:
              setBiometricType('íris');
              break;
            default:
              setBiometricType('biometria');
          }
        }
      }
    };
    init();
  }, [isAuthReady, checkAuthRequired]);

  const handleAuthenticate = useCallback(async () => {
    setAuthenticating(true);
    setAuthError(null);
    setAuthState('loading');

    const result = await authenticate();
    if (result.success) {
      setAuthenticating(false);
      setAuthState('idle');
      setIsLocked(false); // Cadeado abre
      // Aguarda animação do cadeado (~500ms) e dispara transição da folha
      setTimeout(() => {
        setShowLeafTransition(true);
      }, 500);
    } else {
      setAuthError(result.error || t('auth.authFailed'));
      setAuthState('error');
      setAuthenticating(false);
      setTimeout(() => {
        setAuthState('idle');
        setIsLocked(true); // Volta fechado após shake
      }, 1000);
    }
  }, [authenticate, t]);

  const handleTransitionComplete = useCallback(() => {
    setShowAuth(false);
    setShowLeafTransition(false);
    onAuthenticated?.();
  }, [onAuthenticated]);

  const handleCancel = useCallback(() => {
    if (Platform.OS === 'android') {
      Alert.alert(t('auth.authRequired'), t('auth.authRequiredDesc'));
    }
  }, [t]);

  if (!isAuthReady) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>{t('auth.authLoading')}</Text>
      </View>
    );
  }

  // Auth não requerida → app direto
  if (!showAuth) {
    return <>{children}</>;
  }

  // Transição ativa → CannabisLeafTransition por cima de tudo
  if (showLeafTransition) {
    return (
      <CannabisLeafTransition
        visible={true}
        fromChildren={
          <AuthScreen
            theme={theme}
            t={t}
            biometricType={biometricType}
            authState={authState}
            isLocked={isLocked}
            authenticating={authenticating}
            authError={authError}
            onAuthenticate={handleAuthenticate}
            onCancel={handleCancel}
          />
        }
        toChildren={children}
        onComplete={handleTransitionComplete}
        growDuration={800}
        shrinkDuration={400}
        leafColor={theme.colors.primary}
        swapDelay={50}
      />
    );
  }

  // Tela de autenticação normal
  return (
    <AuthScreen
      theme={theme}
      t={t}
      biometricType={biometricType}
      authState={authState}
      isLocked={isLocked}
      authenticating={authenticating}
      authError={authError}
      onAuthenticate={handleAuthenticate}
      onCancel={handleCancel}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  authCard: {
    width: '100%',
    maxWidth: 360,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  error: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  buttonRow: {
    marginTop: 24,
    width: '100%',
  },
  authButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    marginTop: 16,
    fontSize: 14,
  },
});