import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { LockIcon, type AuthState } from './LockIcon';
import { CannabisLeafTransition } from './CannabisLeafTransition';

interface AuthGateProps {
  children: React.ReactNode;
  onAuthenticated?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children, onAuthenticated }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { authenticate, checkAuthRequired, isAuthReady, settings } = useSettings();
  const [showAuth, setShowAuth] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<string>('');
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [isLocked, setIsLocked] = useState(true); // Cadeado começa FECHADO
  const [showLeafTransition, setShowLeafTransition] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isAuthReady) return;

      const required = await checkAuthRequired();
      if (required) {
        setShowAuth(true);
        // Pre-fetch biometric type for UI
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

  const handleAuthenticate = async () => {
    setAuthenticating(true);
    setAuthError(null);
    setAuthState('loading');

    const result = await authenticate();
    if (result.success) {
      setAuthenticating(false);
      setAuthState('idle');
      // Anima o cadeado abrindo
      setIsLocked(false);
      // Aguarda a animação do cadeado abrir (~500ms) e inicia transição da folha
      setTimeout(() => {
        setShowLeafTransition(true);
      }, 500);
    } else {
      setAuthError(result.error || t('auth.authFailed'));
      setAuthState('error');
      setAuthenticating(false);
      // Cadeado shake de erro, depois volta para fechado
      setTimeout(() => {
        setAuthState('idle');
        setIsLocked(true);
      }, 1000);
    }
  };

  const handleTransitionComplete = () => {
    setTransitionComplete(true);
    setShowAuth(false);
    onAuthenticated?.();
  };

  const handleCancel = () => {
    if (Platform.OS === 'android') {
      Alert.alert(t('auth.authRequired'), t('auth.authRequiredDesc'));
    }
  };

  if (!isAuthReady) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>{t('auth.authLoading')}</Text>
      </View>
    );
  }

  // Se autenticação não é necessária, mostra app direto
  if (!showAuth) {
    return <>{children}</>;
  }

  // Se transição completou, mostra app direto (sem máscara)
  if (transitionComplete) {
    return <>{children}</>;
  }

  // Se transição da folha está ativa, mostra a transição (sem botões de auth)
  if (showLeafTransition) {
    return (
      <CannabisLeafTransition
        visible={true}
        onComplete={handleTransitionComplete}
        duration={1200}
        maskColor={theme.colors.primary}
      >
        {children}
      </CannabisLeafTransition>
    );
  }

  // Tela de autenticação (cadeado + botões)
  return (
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
            onPress={handleAuthenticate}
            disabled={authenticating}
            activeOpacity={0.8}
          >
            <Text style={[styles.authButtonText, { color: theme.colors.onPrimary }]}>
              {authenticating ? t('auth.authAuthenticating') : t('auth.authAuthenticateBtn')}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={[styles.cancelText, { color: theme.colors.onSurfaceVariant }]}>
            {t('auth.authCancel')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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