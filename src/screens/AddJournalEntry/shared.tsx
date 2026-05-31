import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';

// ─── Field Input ───

export const FieldInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  theme: any;
}> = ({ label, value, onChange, placeholder, multiline, theme }) => (
  <View style={styles.inputWrap}>
    <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.elevation.level1,
          borderColor: theme.colors.outlineVariant,
          color: theme.colors.onSurface,
        },
        multiline && styles.textArea,
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.onSurfaceVariant}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

// ─── Number Input ───

export const NumberInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  decimal?: boolean;
  theme: any;
}> = ({ label, value, onChange, placeholder, theme }) => (
  <View style={styles.inputWrap}>
    <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.elevation.level1,
          borderColor: theme.colors.outlineVariant,
          color: theme.colors.onSurface,
        },
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.onSurfaceVariant}
      keyboardType="numeric"
    />
  </View>
);

// ─── Option Buttons ───

export const OptionButtons: React.FC<{
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  theme: any;
}> = ({ options, selected, onSelect, theme }) => (
  <View style={styles.optionsRow}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[
          styles.optionBtn,
          {
            backgroundColor: theme.colors.elevation.level1,
            borderColor: theme.colors.outlineVariant,
          },
          opt === selected && {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => onSelect(opt === selected ? '' : opt)}
      >
        <Text
          style={[
            styles.optionText,
            { color: theme.colors.onSurfaceVariant },
            opt === selected && { color: theme.colors.onPrimary },
          ]}
        >
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Sub-label helper ───

export const SubLabel: React.FC<{ text: string; theme: any; style?: TextStyle }> = ({
  text,
  theme,
  style,
}) => (
  <Text style={[styles.subLabel, { color: theme.colors.onSurfaceVariant }, style]}>{text}</Text>
);

// ─── Web input style helper ───

export const webInputStyle = (theme: any): React.CSSProperties => ({
  flex: 1,
  padding: '12px',
  fontSize: 14,
  borderRadius: 10,
  border: `1px solid ${theme.colors.outlineVariant}`,
  backgroundColor: theme.colors.elevation.level1,
  color: theme.colors.onSurface,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
});

export const styles = StyleSheet.create({
  inputWrap: { marginBottom: 10 },
  inputLabel: { fontSize: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  subLabel: { fontSize: 12, marginBottom: 6, marginTop: 10 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: { fontSize: 12, fontWeight: '500' },
  checkbox: {
    padding: 10,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  checkboxText: { fontSize: 14 },
  mediaBtn: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  mediaBtnIcon: { fontSize: 40, marginBottom: 8 },
  mediaBtnText: { fontSize: 14, fontWeight: '600' },
  mediaPreview: { width: '100%', height: 250, borderRadius: 12, marginBottom: 10 },
  videoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreviewText: { fontSize: 14, marginTop: 8 },
  mediaRemoveBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  mediaRemoveText: { fontSize: 14, fontWeight: '600' },
  dateTimeRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  dateTimeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateTimeIcon: { fontSize: 16, marginRight: 8 },
  dateTimeText: { fontSize: 14, fontWeight: '500' },
  dateTimeHint: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  saveBtn: { margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 16, alignItems: 'center', marginBottom: 30 },
  cancelText: { fontSize: 14 },
});
