import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, Platform, useColorScheme,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSettings } from '../context/SettingsContext';
import { useThemeCtx } from '../theme/ThemeProvider';
import type { DateFormat, TimeFormat, AppThemeMode } from '../types/settings';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import ColorBall from '../components/ColorBall';

const SettingsScreen = () => {
  const { settings, updateSettings } = useSettings();
  const { themeMode } = useThemeCtx();
  const theme = useTheme();
  const systemScheme = useColorScheme();

  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const timezoneLabel = settings.timezoneMode === 'auto'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Automático'
    : (settings.customTimezone || 'Automático');

  const dateFormatOptions: { key: DateFormat; label: string; example: string }[] = [
    { key: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '20/05/2026' },
    { key: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '05/20/2026' },
    { key: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-05-20' },
  ];

  const timeFormatOptions: { key: TimeFormat; label: string; example: string }[] = [
    { key: 'HH:mm', label: 'HH:mm', example: '14:30' },
    { key: 'HH:mm:ss', label: 'HH:mm:ss', example: '14:30:00' },
  ];

  const themeOptions: { key: AppThemeMode; label: string; icon: string; desc: string }[] = [
    { key: 'light', label: 'Claro', icon: 'sunny', desc: 'Tema claro padrão' },
    { key: 'dark', label: 'Escuro', icon: 'moon', desc: 'Tema escuro para conforto visual' },
    { key: 'dynamic', label: 'Material You', icon: 'color-palette', desc: 'Cores do sistema Android (fallback verde)' },
  ];

  const isDark = themeMode === 'dark' || (themeMode === 'dynamic' && systemScheme === 'dark');

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title="Configurações" />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* ─── Appearance Group ─── */}
        <Text style={[styles.groupTitle, { color: theme.colors.onSurfaceVariant }]}>🎨 Aparência</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowThemeModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>Tema do app</Text>
              <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>
                {themeOptions.find(o => o.key === settings.themeMode)?.label}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: theme.colors.outline }]}>›</Text>
          </TouchableOpacity>

          {settings.themeMode === 'dynamic' && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
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
        </View>

        {/* ─── Date & Time Group ─── */}
        <Text style={[styles.groupTitle, { color: theme.colors.onSurfaceVariant }]}>🗓️ Data e Hora</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface }]}>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>Fuso horário</Text>
              <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>{timezoneLabel}</Text>
            </View>
            <View style={[styles.autoBadge, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={[styles.autoBadgeText, { color: theme.colors.onPrimaryContainer }]}>Automático</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowDateModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>Formato de data</Text>
              <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>
                {dateFormatOptions.find(o => o.key === settings.dateFormat)?.example}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: theme.colors.outline }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowTimeModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>Formato de hora</Text>
              <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>
                {timeFormatOptions.find(o => o.key === settings.timeFormat)?.example}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: theme.colors.outline }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Placeholder ─── */}
        <Text style={[styles.groupTitle, { color: theme.colors.onSurfaceVariant }]}>🔧 Em breve</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, opacity: 0.5 }]}>
          <View style={styles.settingRowDisabled}>
            <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>Unidades (ml, oz, galões...)</Text>
            <Text style={[styles.comingSoon, { color: theme.colors.onSurfaceVariant }]}>Em breve</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.settingRowDisabled}>
            <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>Backup e restauração</Text>
            <Text style={[styles.comingSoon, { color: theme.colors.onSurfaceVariant }]}>Em breve</Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── Theme Modal ─── */}
      <Modal visible={showThemeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Tema do App</Text>
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
                  <Text style={[
                    styles.modalOptionText,
                    { color: theme.colors.onSurface },
                    settings.themeMode === opt.key && { color: theme.colors.primary, fontWeight: '600' },
                  ]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.modalOptionDesc, { color: theme.colors.onSurfaceVariant }]}>{opt.desc}</Text>
                </View>
                {settings.themeMode === opt.key && (
                  <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalCancel, { borderTopColor: theme.colors.outlineVariant }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.error }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Date Format Modal ─── */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Formato de Data</Text>
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
                <Text style={[
                  styles.modalOptionText,
                  { color: theme.colors.onSurface },
                  settings.dateFormat === opt.key && { color: theme.colors.primary, fontWeight: '600' },
                ]}>
                  {opt.label}
                </Text>
                <Text style={[styles.modalExample, { color: theme.colors.onSurfaceVariant }]}>{opt.example}</Text>
                {settings.dateFormat === opt.key && (
                  <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalCancel, { borderTopColor: theme.colors.outlineVariant }]}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.error }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Time Format Modal ─── */}
      <Modal visible={showTimeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Formato de Hora</Text>
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
                <Text style={[
                  styles.modalOptionText,
                  { color: theme.colors.onSurface },
                  settings.timeFormat === opt.key && { color: theme.colors.primary, fontWeight: '600' },
                ]}>
                  {opt.label}
                </Text>
                <Text style={[styles.modalExample, { color: theme.colors.onSurfaceVariant }]}>{opt.example}</Text>
                {settings.timeFormat === opt.key && (
                  <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalCancel, { borderTopColor: theme.colors.outlineVariant }]}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.error }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  groupTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  group: { borderRadius: 12, overflow: 'hidden' as const },

  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingRowDisabled: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '500' },
  settingValue: { fontSize: 13, marginTop: 2 },
  autoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  autoBadgeText: { fontSize: 11, fontWeight: '600' },
  chevron: { fontSize: 22, marginLeft: 8 },
  comingSoon: { fontSize: 12, fontStyle: 'italic' as const },
  divider: { height: 1, marginLeft: 16 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, margin: 8, borderRadius: 8, gap: 8 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { borderRadius: 16, paddingBottom: 16, margin: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', padding: 16, textAlign: 'center' as const },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 8 },
  modalOptionIcon: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modalOptionTextWrap: { flex: 1 },
  modalOptionText: { fontSize: 16, fontWeight: '500' },
  modalOptionDesc: { fontSize: 12, marginTop: 2 },
  modalExample: { fontSize: 13, marginRight: 12 },
  checkmark: { fontSize: 18, fontWeight: '700' },
  modalCancel: { padding: 16, alignItems: 'center', borderTopWidth: 1, marginTop: 8 },
  modalCancelText: { fontSize: 16, fontWeight: '600' },
  modalDivider: { height: 1, marginVertical: 8, marginHorizontal: 16 },
});

export default SettingsScreen;
