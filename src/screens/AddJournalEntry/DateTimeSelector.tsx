import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const toIsoDateString = (d: Date) => d.toISOString().slice(0, 10);
const toIsoTimeString = (d: Date) => d.toTimeString().slice(0, 5);
const fromIsoDateAndTime = (dateStr: string, timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  const dt = new Date(dateStr + 'T00:00:00');
  dt.setHours(h, m);
  return dt;
};

interface Props {
  entryDate: Date;
  onDateChange: (d: Date) => void;
  showDatePicker: boolean;
  onShowDatePicker: (v: boolean) => void;
  showTimePicker: boolean;
  onShowTimePicker: (v: boolean) => void;
  theme: any;
}

export const DateTimeSelector: React.FC<Props> = ({
  entryDate,
  onDateChange,
  showDatePicker,
  onShowDatePicker,
  showTimePicker,
  onShowTimePicker,
  theme,
}) => {
  const webStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    fontSize: 14,
    borderRadius: 10,
    border: `1px solid ${theme.colors.outlineVariant}`,
    backgroundColor: theme.colors.elevation.level1,
    color: theme.colors.onSurface,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
          Data e hora do registro
        </Text>
        <View style={styles.dateTimeRow}>
          <input
            type="date"
            value={toIsoDateString(entryDate)}
            max={toIsoDateString(new Date())}
            onChange={(e) => {
              if (e.target.value) {
                onDateChange(fromIsoDateAndTime(e.target.value, toIsoTimeString(entryDate)));
              }
            }}
            style={webStyle}
          />
          <input
            type="time"
            value={toIsoTimeString(entryDate)}
            onChange={(e) => {
              if (e.target.value) {
                onDateChange(fromIsoDateAndTime(toIsoDateString(entryDate), e.target.value));
              }
            }}
            style={webStyle}
          />
        </View>
        <Text style={[styles.hint, { color: theme.colors.outline }]}>
          Permite registrar eventos passados caso tenha esquecido
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
          Data e hora do registro
        </Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={[
              styles.dateTimeBtn,
              {
                backgroundColor: theme.colors.elevation.level1,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
            onPress={() => onShowDatePicker(true)}
          >
            <Text style={styles.dateTimeIcon}>🗓️</Text>
            <Text style={[styles.dateTimeText, { color: theme.colors.onSurface }]}>
              {entryDate.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dateTimeBtn,
              {
                backgroundColor: theme.colors.elevation.level1,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
            onPress={() => onShowTimePicker(true)}
          >
            <Text style={styles.dateTimeIcon}>🕐</Text>
            <Text style={[styles.dateTimeText, { color: theme.colors.onSurface }]}>
              {entryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.hint, { color: theme.colors.outline }]}>
          Permite registrar eventos passados caso tenha esquecido
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={entryDate}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              onShowDatePicker(false);
            }
            if (selectedDate) {
              const local = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
              onDateChange(local);
            }
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={entryDate}
          mode="time"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              onShowTimePicker(false);
            }
            if (selectedDate) {
              const merged = new Date(entryDate);
              merged.setHours(selectedDate.getHours(), selectedDate.getMinutes());
              onDateChange(merged);
            }
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
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
  hint: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
});
