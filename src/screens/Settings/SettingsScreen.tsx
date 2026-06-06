import React from 'react';
import { View, ScrollView, useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import TopHeader from '../../components/TopHeader';
import ColorBall from '../../components/ColorBall';
import { styles } from './styles';

// Components
import { SettingRow, SectionGroup, Divider } from './components';

// Sections
import { AppearanceSection } from './sections/AppearanceSection';
import { DateTimeSection } from './sections/DateTimeSection';
import { LanguageSection } from './sections/LanguageSection';
import { SecuritySection } from './sections/SecuritySection';
import { AboutSection } from './sections/AboutSection';

// Modals
import { ThemeModal } from './modals/ThemeModal';
import { LanguageModal } from './modals/LanguageModal';
import { DateFormatModal } from './modals/DateFormatModal';
import { TimeFormatModal } from './modals/TimeFormatModal';
import { EncryptionConfirmModal } from './modals/EncryptionConfirmModal';
import { AuthConfirmModal } from './modals/AuthConfirmModal';

// Hook
import { useSettingsScreen } from './hooks/useSettingsScreen';

/**
 * Tela de Configurações principal.
 * Refatorada em componentes menores:
 * - components/: componentes reutilizáveis (SettingRow, SectionGroup, Divider, SelectionModal)
 * - sections/: cada grupo de configurações (Appearance, DateTime, Language, Security, About)
 * - modals/: modais de seleção e confirmação
 * - hooks/useSettingsScreen: lógica de estado e handlers
 * - constants/: arrays de opções (temas, idiomas, formatos)
 */
const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Toda a lógica extraída para o hook
  const {
    settings,
    isEncryptionReady,
    isAuthReady,
    checking,
    updateInfo,
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
    openThemeModal,
    openLangModal,
    openDateModal,
    openTimeModal,
    handleEncryptionToggle,
    confirmEncryptionChange,
    handleAuthToggle,
    confirmAuthChange,
    handleCheckUpdates,
  } = useSettingsScreen();

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title={t('settings.title')} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* ─── Seção Aparência ─── */}
          <AppearanceSection theme={theme} onThemePress={openThemeModal} />

          {/* ─── Seção Data e Hora ─── */}
          <DateTimeSection
            theme={theme}
            onDatePress={openDateModal}
            onTimePress={openTimeModal}
          />

          {/* ─── Seção Idioma ─── */}
          <LanguageSection theme={theme} onLangPress={openLangModal} />

          {/* ─── Seção Segurança ─── */}
          <SecuritySection
            theme={theme}
            onEncryptionPress={handleEncryptionToggle}
            onAuthPress={handleAuthToggle}
            encryptionReady={isEncryptionReady}
            encryptionBusy={encryptionBusy}
            authReady={isAuthReady}
            authBusy={authBusy}
            encryptData={settings.encryptData}
            requireAuth={settings.requireAuth}
          />

          {/* ─── Seção Sobre ─── */}
          <AboutSection
            theme={theme}
            onCheckUpdates={handleCheckUpdates}
            checking={checking}
          />
        </ScrollView>

        {/* ─── Modais ─── */}
        <ThemeModal
          visible={showThemeModal}
          theme={theme}
          onClose={() => setShowThemeModal(false)}
        />

        <LanguageModal
          visible={showLangModal}
          theme={theme}
          onClose={() => setShowLangModal(false)}
        />

        <DateFormatModal
          visible={showDateModal}
          theme={theme}
          onClose={() => setShowDateModal(false)}
        />

        <TimeFormatModal
          visible={showTimeModal}
          theme={theme}
          onClose={() => setShowTimeModal(false)}
        />

        <EncryptionConfirmModal
          visible={showEncryptionModal}
          theme={theme}
          onClose={() => setShowEncryptionModal(false)}
          onConfirm={confirmEncryptionChange}
          pendingValue={pendingEncryptionValue}
          busy={encryptionBusy}
        />

        <AuthConfirmModal
          visible={showAuthModal}
          theme={theme}
          onClose={() => setShowAuthModal(false)}
          onConfirm={confirmAuthChange}
          pendingValue={pendingAuthValue}
          busy={authBusy}
        />
      </View>
    </View>
  );
};

export default SettingsScreen;