import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LEGEND_ITEMS } from './constants';

interface Props {
  theme: any;
}

export const CalendarLegend: React.FC<Props> = ({ theme }) => (
  <View style={[styles.legend, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}>
    <View style={styles.legendGroup}>
      <Text style={[styles.legendGroupTitle, { color: theme.colors.onSurfaceVariant }]}>Estágios</Text>
      <View style={styles.legendRow}>
        {LEGEND_ITEMS.slice(0, 8).map((item) => (
          <View key={item.label} style={styles.legendChip}>
            <Text style={{ fontSize: 11 }}>{item.icon}</Text>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
    <View style={styles.legendGroup}>
      <Text style={[styles.legendGroupTitle, { color: theme.colors.onSurfaceVariant }]}>Registros</Text>
      <View style={styles.legendRow}>
        {LEGEND_ITEMS.slice(8).map((item) => (
          <View key={item.label} style={styles.legendChip}>
            <Text style={{ fontSize: 11 }}>{item.icon}</Text>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  legend: { borderBottomWidth: 1, paddingVertical: 8, paddingHorizontal: 10 },
  legendGroup: { marginBottom: 4 },
  legendGroupTitle: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  legendChip: { flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 2 },
  legendDot: { width: 7, height: 7, borderRadius: 3, marginRight: 3 },
  legendText: { fontSize: 10 },
});
