import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, useColorScheme, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import { useThemeCtx } from '../../theme/ThemeProvider';
import type { DateFormat, TimeFormat, AppThemeMode } from '../../types/settings';
import ColorBall from '../../components/ColorBall';
import TopHeader from '../../components/TopHeader';
import { styles } from './styles';

const themeOptions: { key: AppThemeMode; labelKey: string; icon: string; descKey: string }[] = [
  { key: 'light', labelKey: 'settings.themeLight', icon: 'sunny', descKey: 'settings.themeLight' },
  { key: 'dark', labelKey: 'settings.themeDark', icon: 'moon', descKey: 'settings.themeDark' },
  { key: 'dynamic', labelKey: 'settings.themeSystem', icon: 'color-palette', descKey: 'settings.themeSystem' },
];

const languageOptions: { key: string; labelKey: string }[] = [
  { key: 'pt', labelKey: 'settings.languagePt' },
  { key: 'en', labelKey: 'settings.languageEn' },
];

const dateFormatOptions: { key: DateFormat; label: string; example: string }[] = [
  { key: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '20/05/2026' },
  { key: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '05/20/2026' },
  { key: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-05-20' },
];

const timeFormatOptions: { key: TimeFormat; label: string; example: string }[] = [
  { key: 'HH:mm', label: '24h', example: '14:30' },
  { key: 'HH:mm:ss', label: '24h', example: '14:30:00' },
];

const SettingRow: React.FC<{
  label: string;
  value: string;
  onPress: () => void;
  badge?: string;
  theme: any;
}> = ({ label, value, onPress, badge, theme }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingInfo}>
      <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>{label}</Text>
      <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>{value}</Text>
    </View>
    {badge ? (
      <View style={[styles.autoBadge, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.autoBadgeText, { color: theme.colors.onPrimaryContainer }]}>{badge}</Text>
      </View>
    ) : (
      <Text style={[styles.chevron, { color: theme.colors.outline }]}>›</Text>
    )}
  </TouchableOpacity>
);

const SectionGroup: React.FC<{
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  theme: any;
}> = ({ title, children, disabled, theme }) => (
  <>
    <Text style={[styles.groupTitle, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
    <View style={[styles.group, { backgroundColor: theme.colors.surface, opacity: disabled ? 0.5 : 1 }]}>
      {children}
    </View>
  </>
);

const Divider: React.FC<{ theme: any }> = ({ theme }) => (
  <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
);

const SelectionModal: React.FC<{
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  cancelLabel: string;
  theme: any;
}> = ({ visible, title, children, onCancel, cancelLabel, theme }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        {children}
        <TouchableOpacity
          style={[styles.modalCancel, { borderTopColor: theme.colors.outlineVariant }]}
          onPress={onCancel}
        >
          <Text style={[styles.modalCancelText, { color: theme.colors.error }]}>{cancelLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { themeMode } = useThemeCtx();
  const theme = useTheme();
  const systemScheme = useColorScheme();
  const { t, i18n } = useTranslation();

  const [showDateModal, setShowDateModal] = React.useState(false);
  const [showTimeModal, setShowTimeModal] = React.useState(false);
  const [showThemeModal, setShowThemeModal] = React.useState(false);
  const [showLangModal, setShowLangModal] = React.useState(false);

  const timezoneLabel = settings.timezoneMode === 'auto'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || t('settings.languageSystem')
    : (settings.customTimezone || t('settings.languageSystem'));

  const isDark = themeMode === 'dark' || (themeMode === 'dynamic' && systemScheme === 'dark');

  const currentThemeOpt = themeOptions.find((o) => o.key === settings.themeMode);
  const currentThemeLabel = currentThemeOpt ? t(currentThemeOpt.labelKey) : '';

  const currentLangOpt = languageOptions.find((o) => o.key === i18n.language);
  const currentLangLabel = currentLangOpt ? t(currentLangOpt.labelKey) : t('settings.languageSystem');

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title={t('settings.title')} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* ─── Appearance Group ─── */}
          <SectionGroup title={t('settings.sectionAppearance')} theme={theme}>
            <SettingRow
              label={t('settings.theme')}
              value={currentThemeLabel}
              onPress={() => setShowThemeModal(true)}
              theme={theme}
            />

            {settings.themeMode === 'dynamic' && (
              <>
                <Divider theme={theme} />
                <View style={[styles.infoRow, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#E3F2FD' }]}>
                  <Ionicons name="information-circle" size={16} color={isDark ? theme.colors.primary : '#2196F3'} />
                  <Text style={[styles.infoText, { color: isDark ? theme.colors.onSurfaceVariant : '#1565C0' }]}>
                    {Platform.OS === 'android'
                      ? t('settings.themeSystem')
                      : t('settings.themeSystem')}
                  </Text>
                </View>
              </>
            )}
          </SectionGroup>

          {/* ─── Date & Time Group ─── */}
          <SectionGroup title={t('settings.sectionFormats')} theme={theme}>
            <SettingRow
              label={t('settings.timezone')}
              value={timezoneLabel}
              onPress={() => {}}
              badge={t('settings.languageSystem')}
              theme={theme}
            />

            <Divider theme={theme} />

            <SettingRow
              label={t('settings.dateFormat')}
              value={dateFormatOptions.find((o) => o.key === settings.dateFormat)?.example ?? ''}
              onPress={() => setShowDateModal(true)}
              theme={theme}
            />

            <Divider theme={theme} />

            <SettingRow
              label={t('settings.timeFormat')}
              value={timeFormatOptions.find((o) => o.key === settings.timeFormat)?.example ?? ''}
              onPress={() => setShowTimeModal(true)}
              theme={theme}
            />
          </SectionGroup>

          {/* ─── Language Group ─── */}
          <SectionGroup title={t('settings.sectionLanguage')} theme={theme}>
            <SettingRow
              label={t('settings.language')}
              value={currentLangLabel}
              onPress={() => setShowLangModal(true)}
              theme={theme}
            />
          </SectionGroup>

          {/* ─── About ─── */}
          <SectionGroup title={t('settings.sectionAbout')} disabled theme={theme}>
            <View style={styles.settingRowDisabled}>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                {t('settings.appVersion')}
              </Text>
              <Text style={[styles.comingSoon, { color: theme.colors.onSurfaceVariant }]}>v0.2.0-alpha</Text>
            </View>
          </SectionGroup>
        </ScrollView>

        {/* ─── Theme Modal ─── */}
        <SelectionModal
          visible={showThemeModal}
          title={t('settings.theme')}
          onCancel={() => setShowThemeModal(false)}
          cancelLabel={t('journal.cancelBtn')}
          theme={theme}
        >
          <ColorBall />
          <View style={[styles.modalDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          {themeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.modalOption,
                settings.themeMode === opt.key && { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 },
              ]}
              onPress={() => {
                updateSettings({ themeMode: opt.key });
                setShowThemeModal(false);
              }}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons
                  name={opt.icon as any}
                  size={22}
                  color={settings.themeMode === opt.key ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
              </View>
              <View style={styles.modalOptionTextWrap}>
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: theme.colors.onSurface },
                    settings.themeMode === opt.key && { color: theme.colors.primary, fontWeight: '600' },
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
                <Text style={[styles.modalOptionDesc, { color: theme.colors.onSurfaceVariant }]}>{t(opt.descKey)}</Text>
              </View>
              {settings.themeMode === opt.key && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </SelectionModal>

        {/* ─── Language Modal ─── */}
        <SelectionModal
          visible={showLangModal}
          title={t('settings.language')}
          onCancel={() => setShowLangModal(false)}
          cancelLabel={t('journal.cancelBtn')}
          theme={theme}
        >
          {languageOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.modalOption,
                i18n.language === opt.key && { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 },
              ]}
              onPress={() => {
                i18n.changeLanguage(opt.key);
                setShowLangModal(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: theme.colors.onSurface },
                  i18n.language === opt.key && { color: theme.colors.primary, fontWeight: '600' },
                ]}
              >
                {t(opt.labelKey)}
              </Text>
              {i18n.language === opt.key && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </SelectionModal>

        {/* ─── Date Format Modal ─── */}
        <SelectionModal
          visible={showDateModal}
          title={t('settings.dateFormat')}
          onCancel={() => setShowDateModal(false)}
          cancelLabel={t('journal.cancelBtn')}
          theme={theme}
        >
          {dateFormatOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.modalOption,
                settings.dateFormat === opt.key && { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 },
              ]}
              onPress={() => {
                updateSettings({ dateFormat: opt.key });
                setShowDateModal(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: theme.colors.onSurface },
                  settings.dateFormat === opt.key && { color: theme.colors.primary, fontWeight: '600' },
                ]}
              >
                {opt.label}
              </Text>
              <Text style={[styles.modalExample, { color: theme.colors.onSurfaceVariant }]}>{opt.example}</Text>
              {settings.dateFormat === opt.key && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </SelectionModal>

        {/* ─── Time Format Modal ─── */}
        <SelectionModal
          visible={showTimeModal}
          title={t('settings.timeFormat')}
          onCancel={() => setShowTimeModal(false)}
          cancelLabel={t('journal.cancelBtn')}
          theme={theme}
        >
          {timeFormatOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.modalOption,
                settings.timeFormat === opt.key && { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 },
              ]}
              onPress={() => {
                updateSettings({ timeFormat: opt.key });
                setShowTimeModal(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: theme.colors.onSurface },
                  settings.timeFormat === opt.key && { color: theme.colors.primary, fontWeight: '600' },
                ]}
              >
                {opt.label}
              </Text>
              <Text style={[styles.modalExample, { color: theme.colors.onSurfaceVariant }]}>{opt.example}</Text>
              {settings.timeFormat === opt.key && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </SelectionModal>
      </View>
    </View>
  );
};

export default SettingsScreen;
