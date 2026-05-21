import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, Platform,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import type { DateFormat, TimeFormat } from '../types/settings';

const SettingsScreen = () => {
  const { settings, updateSettings } = useSettings();

  // Date format picker
  const [showDateModal, setShowDateModal] = useState(false);
  // Time format picker
  const [showTimeModal, setShowTimeModal] = useState(false);
  // Timezone info (for now just display)
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* ─── Date & Time Group ─── */}
        <Text style={styles.groupTitle}>📅 Data e Hora</Text>
        <View style={styles.group}>

          {/* Timezone */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Fuso horário</Text>
              <Text style={styles.settingValue}>{timezoneLabel}</Text>
            </View>
            <View style={styles.autoBadge}>
              <Text style={styles.autoBadgeText}>Automático</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date Format */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowDateModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Formato de data</Text>
              <Text style={styles.settingValue}>
                {dateFormatOptions.find(o => o.key === settings.dateFormat)?.example}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Time Format */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowTimeModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Formato de hora</Text>
              <Text style={styles.settingValue}>
                {timeFormatOptions.find(o => o.key === settings.timeFormat)?.example}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Placeholder for future settings ─── */}
        <Text style={styles.groupTitle}>🔧 Em breve</Text>
        <View style={styles.group}>
          <View style={styles.settingRowDisabled}>
            <Text style={styles.settingLabel}>Unidades (ml, oz, galões...)</Text>
            <Text style={styles.comingSoon}>Em breve</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRowDisabled}>
            <Text style={styles.settingLabel}>Tema do app</Text>
            <Text style={styles.comingSoon}>Em breve</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRowDisabled}>
            <Text style={styles.settingLabel}>Backup e restauração</Text>
            <Text style={styles.comingSoon}>Em breve</Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── Date Format Modal ─── */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Formato de Data</Text>
            {dateFormatOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.modalOption,
                  settings.dateFormat === opt.key && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateSettings({ dateFormat: opt.key });
                  setShowDateModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  settings.dateFormat === opt.key && styles.modalOptionTextSelected,
                ]}>
                  {opt.label}
                </Text>
                <Text style={styles.modalExample}>{opt.example}</Text>
                {settings.dateFormat === opt.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Time Format Modal ─── */}
      <Modal visible={showTimeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Formato de Hora</Text>
            {timeFormatOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.modalOption,
                  settings.timeFormat === opt.key && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateSettings({ timeFormat: opt.key });
                  setShowTimeModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  settings.timeFormat === opt.key && styles.modalOptionTextSelected,
                ]}>
                  {opt.label}
                </Text>
                <Text style={styles.modalExample}>{opt.example}</Text>
                {settings.timeFormat === opt.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 32 },
  groupTitle: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  group: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },

  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingRowDisabled: { flexDirection: 'row', alignItems: 'center', padding: 16, opacity: 0.5 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  settingValue: { fontSize: 13, color: '#888', marginTop: 2 },
  autoBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  autoBadgeText: { fontSize: 11, color: '#2e7d32', fontWeight: '600' },
  chevron: { fontSize: 22, color: '#ccc', marginLeft: 8 },
  comingSoon: { fontSize: 12, color: '#aaa', fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, paddingBottom: 16, margin: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', padding: 16, textAlign: 'center' },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 8 },
  modalOptionSelected: { backgroundColor: '#e8f5e9', borderRadius: 8 },
  modalOptionText: { fontSize: 16, color: '#333', fontWeight: '500', flex: 1 },
  modalOptionTextSelected: { color: '#2e7d32', fontWeight: '600' },
  modalExample: { fontSize: 13, color: '#888', marginRight: 12 },
  checkmark: { fontSize: 18, color: '#2e7d32', fontWeight: '700' },
  modalCancel: { padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 8 },
  modalCancelText: { fontSize: 16, color: '#e53935', fontWeight: '600' },
});

export default SettingsScreen;
