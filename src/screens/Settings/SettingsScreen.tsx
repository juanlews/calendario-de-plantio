import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, useColorScheme, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useSettings } from '../../context/SettingsContext';
import { useThemeCtx } from '../../theme/ThemeProvider';
import type { DateFormat, TimeFormat, AppThemeMode } from '../../types/settings';
import ColorBall from '../../components/ColorBall';
import TopHeader from '../../components/TopHeader';
import { styles } from './styles';

const themeOptions: { key: AppThemeMode; label: string; icon: string; desc: string }[] = [
  { key: 'light', label: 'Claro', icon: 'sunny', desc: 'Tema claro padrão' },
  { key: 'dark', label: 'Escuro', icon: 'moon', desc: 'Tema escuro para conforto visual' },
  { key: 'dynamic', label: 'Material You', icon: 'color-palette', desc: 'Cores do sistema Android (fallback verde)' },
];

const dateFormatOptions: { key: DateFormat; label: string; example: string }[] = [
  { key: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '20/05/2026' },
  { key: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '05/20/2026' },
  { key: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-05-20' },
];

const timeFormatOptions: { key: TimeFormat; label: string; example: string }[] = [
  { key: 'HH:mm', label: 'HH:mm', example: '14:30' },
  { key: 'HH:mm:ss', label: 'HH:mm:ss', example: '14:30:00' },
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
  theme: any;
}> = ({ visible, title, children, onCancel, theme }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        {children}
        <TouchableOpacity
          style={[styles.modalCancel, { borderTopColor: theme.colors.outlineVariant }]}
          onPress={onCancel}
        >
          <Text style={[styles.modalCancelText, { color: theme.colors.error }]}>Cancelar</Text>
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

  const [showDateModal, setShowDateModal] = React.useState(false);
  const [showTimeModal, setShowTimeModal] = React.useState(false);
  const [showThemeModal, setShowThemeModal] = React.useState(false);

  const timezoneLabel = settings.timezoneMode === 'auto'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Automático'
    : (settings.customTimezone || 'Automático');

  const isDark = themeMode === 'dark' || (themeMode === 'dynamic' && systemScheme === 'dark');

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title="Configurações" />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* ─── Appearance Group ─── */}
          <SectionGroup title="🎨 Aparência" theme={theme}>
            <SettingRow
              label="Tema do app"
              value={themeOptions.find((o) => o.key === settings.themeMode)?.label ?? ''}
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
                      ? 'Usando cores dinâmicas do Android (Material You). Se indisponível, usa verde como fallback.'
                      : 'Material You não disponível neste dispositivo. Usando tema verde como fallback.'}
                  </Text>
                </View>
              </>
            )}
          </SectionGroup>

          {/* ─── Date & Time Group ─── */}
          <SectionGroup title="🗓️ Data e Hora" theme={theme}>
            <SettingRow
              label="Fuso horário"
              value={timezoneLabel}
              onPress={() => {}}
              badge="Automático"
              theme={theme}
            />

            <Divider theme={theme} />

            <SettingRow
              label="Formato de data"
              value={dateFormatOptions.find((o) => o.key === settings.dateFormat)?.example ?? ''}
              onPress={() => setShowDateModal(true)}
              theme={theme}
            />

            <Divider theme={theme} />

            <SettingRow
              label="Formato de hora"
              value={timeFormatOptions.find((o) => o.key === settings.timeFormat)?.example ?? ''}
              onPress={() => setShowTimeModal(true)}
              theme={theme}
            />
          </SectionGroup>

          {/* ─── Placeholder ─── */}
          <SectionGroup title="🔧 Em breve" disabled theme={theme}>
            <View style={styles.settingRowDisabled}>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                Unidades (ml, oz, galões...)
              </Text>
              <Text style={[styles.comingSoon, { color: theme.colors.onSurfaceVariant }]}>Em breve</Text>
            </View>
            <Divider theme={theme} />
            <View style={styles.settingRowDisabled}>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                Backup e restauração
              </Text>
              <Text style={[styles.comingSoon, { color: theme.colors.onSurfaceVariant }]}>Em breve</Text>
            </View>
          </SectionGroup>
        </ScrollView>

        {/* ─── Theme Modal ─── */}
        <SelectionModal
          visible={showThemeModal}
          title="Tema do App"
          onCancel={() => setShowThemeModal(false)}
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
                  {opt.label}
                </Text>
                <Text style={[styles.modalOptionDesc, { color: theme.colors.onSurfaceVariant }]}>{opt.desc}</Text>
              </View>
              {settings.themeMode === opt.key && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </SelectionModal>

        {/* ─── Date Format Modal ─── */}
        <SelectionModal
          visible={showDateModal}
          title="Formato de Data"
          onCancel={() => setShowDateModal(false)}
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
          title="Formato de Hora"
          onCancel={() => setShowTimeModal(false)}
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
