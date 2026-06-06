import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUpdateCheck } from '../../../hooks/useUpdateCheck';
import { useSettings } from '../../../context/SettingsContext';

/**
 * Hook customizado que encapsula toda a lógica da SettingsScreen.
 * Gerencia estados de modais, handlers de toggle e confirmações.
 * Mantém o componente principal limpo e focado apenas em renderização.
 */
export const useSettingsScreen = () => {
  const { settings, updateSettings, toggleEncryption, isEncryptionReady, toggleAuth, isAuthReady } = useSettings();
  const { t } = useTranslation();
  const { updateInfo, checking, checkUpdates, showUpdateModal } = useUpdateCheck();

  // Estados dos modais
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [pendingEncryptionValue, setPendingEncryptionValue] = useState(false);
  const [encryptionBusy, setEncryptionBusy] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAuthValue, setPendingAuthValue] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  // Handlers para abrir modais
  const openThemeModal = useCallback(() => setShowThemeModal(true), []);
  const openLangModal = useCallback(() => setShowLangModal(true), []);
  const openDateModal = useCallback(() => setShowDateModal(true), []);
  const openTimeModal = useCallback(() => setShowTimeModal(true), []);

  // Handlers de toggle criptografia
  const handleEncryptionToggle = useCallback(() => {
    setPendingEncryptionValue(!settings.encryptData);
    setShowEncryptionModal(true);
  }, [settings.encryptData]);

  const confirmEncryptionChange = useCallback(async () => {
    setEncryptionBusy(true);
    try {
      await toggleEncryption(pendingEncryptionValue);
      setShowEncryptionModal(false);
    } catch (error) {
      Alert.alert(t('settings.encryptError'), t('settings.encryptErrorDesc'));
    } finally {
      setEncryptionBusy(false);
    }
  }, [pendingEncryptionValue, toggleEncryption, t]);

  // Handlers de toggle autenticação
  const handleAuthToggle = useCallback(() => {
    setPendingAuthValue(!settings.requireAuth);
    setShowAuthModal(true);
  }, [settings.requireAuth]);

  const confirmAuthChange = useCallback(async () => {
    setAuthBusy(true);
    try {
      await toggleAuth(pendingAuthValue);
      setShowAuthModal(false);
    } catch (error) {
      Alert.alert(t('settings.authError'), t('settings.authErrorDesc'));
    } finally {
      setAuthBusy(false);
    }
  }, [pendingAuthValue, toggleAuth, t]);

  // Handler de verificação de atualizações
  const handleCheckUpdates = useCallback(async () => {
    const result = await checkUpdates(true);
    if (result.hasUpdate && result.releaseInfo) {
      showUpdateModal(result.releaseInfo);
    } else if (!result.hasUpdate) {
      Alert.alert(t('update.availableTitle'), t('update.noUpdate'));
    } else if (result.error) {
      Alert.alert(t('update.error'), result.error);
    }
  }, [checkUpdates, showUpdateModal, t]);

  return {
    // Estados
    settings,
    isEncryptionReady,
    isAuthReady,
    checking,
    updateInfo,
    // Modais
    showThemeModal,
    setShowThemeModal,
    showLangModal,
    setShowLangModal,
    showDateModal,
    setShowDateModal,
    showTimeModal,
    setShowTimeModal,
    showEncryptionModal,
    setShowEncryptionModal,
    pendingEncryptionValue,
    encryptionBusy,
    showAuthModal,
    setShowAuthModal,
    pendingAuthValue,
    authBusy,
    // Handlers
    openThemeModal,
    openLangModal,
    openDateModal,
    openTimeModal,
    handleEncryptionToggle,
    confirmEncryptionChange,
    handleAuthToggle,
    confirmAuthChange,
    handleCheckUpdates,
  };
};