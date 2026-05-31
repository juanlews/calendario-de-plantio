import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';

export const settingsOptions = [
  {
    key: 'use24Hours',
    title: 'Formato 24h',
    description: 'Usar formato 24 horas (ex: 14:30)',
    type: 'switch',
  },
  {
    key: 'useImperial',
    title: 'Sistema Imperial',
    description: 'Usar unidades imperiais (oz, gal, etc.)',
    type: 'switch',
  },
  {
    key: 'firstDayOfWeek',
    title: 'Primeiro dia da semana',
    options: [
      { label: 'Domingo', value: 'sunday' },
      { label: 'Segunda', value: 'monday' },
    ],
    type: 'select',
  },
  {
    key: 'theme',
    title: 'Tema',
    options: [
      { label: 'Claro', value: 'light' },
      { label: 'Escuro', value: 'dark' },
      { label: 'Sistema', value: 'system' },
    ],
    type: 'select',
  },
];

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600' },
  settingDescription: { fontSize: 12, marginTop: 4 },
  toggle: { transform: [{ scale: 0.8 }] },
  selectContainer: { flexDirection: 'row', gap: 8, marginTop: 8 },
  selectOption: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectOptionText: { fontSize: 14 },
  selectSelected: { fontWeight: '700' },
});
