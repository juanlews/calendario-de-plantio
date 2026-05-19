import React, { useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { format, parseISO, isValid } from 'date-fns';
import { usePlants } from '../context/PlantContext';
import { formatDate, daysRemaining, dateStatus, stageIcon, stageColor } from '../utils/dateUtils';
import { getStrainInfo } from '../data/strains';

const CalendarScreen = () => {
  const { plantings, loading, updateStage, deletePlanting } = usePlants();
  const [selectedDate, setSelectedDate] = React.useState<string>('');

  // Build calendar marks
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    plantings.forEach((p) => {
      // Seed date - green
      if (!marks[p.seedDate]) marks[p.seedDate] = { dots: [], marked: true };
      marks[p.seedDate].dots.push({ key: 'seed', color: '#4CAF50' });

      // Expected flowering - purple
      if (p.expectedFloweringDate) {
        if (!marks[p.expectedFloweringDate]) marks[p.expectedFloweringDate] = { dots: [], marked: true };
        marks[p.expectedFloweringDate].dots.push({ key: 'exp-flower', color: '#9C27B0' });
      }

      // Actual flowering date - pink
      if (p.floweringDate) {
        if (!marks[p.floweringDate]) marks[p.floweringDate] = { dots: [], marked: true };
        marks[p.floweringDate].dots.push({ key: 'flower', color: '#E91E63' });
      }

      // Expected harvest - orange
      if (p.expectedHarvestDate) {
        if (!marks[p.expectedHarvestDate]) marks[p.expectedHarvestDate] = { dots: [], marked: true };
        marks[p.expectedHarvestDate].dots.push({ key: 'exp-harvest', color: '#FF9800' });
      }

      // Actual harvest - red
      if (p.harvestDate) {
        if (!marks[p.harvestDate]) marks[p.harvestDate] = { dots: [], marked: true };
        marks[p.harvestDate].dots.push({ key: 'harvest', color: '#f44336' });
      }
    });

    // Today highlight
    const today = format(new Date(), 'yyyy-MM-dd');
    if (marks[today]) {
      marks[today].selected = true;
      marks[today].selectedColor = '#2e7d32';
    } else {
      marks[today] = { selected: true, selectedColor: '#2e7d32', dots: [] };
    }

    return marks;
  }, [plantings]);

  const selectedPlantings = useMemo(() => {
    if (!selectedDate) return [];
    return plantings.filter(
      (p) =>
        p.seedDate === selectedDate ||
        p.floweringDate === selectedDate ||
        p.harvestDate === selectedDate ||
        p.expectedFloweringDate === selectedDate ||
        p.expectedHarvestDate === selectedDate,
    );
  }, [plantings, selectedDate]);

  const upcomingEvents = useMemo(() => {
    const events: { p: typeof plantings[0]; label: string; type: string; days: number }[] = [];
    plantings.forEach((p) => {
      const check = (dateStr: string | null, label: string, type: string) => {
        if (!dateStr) return;
        const d = daysRemaining(dateStr);
        if (d >= 0 && d <= 45) events.push({ p, label, type, days: d });
      };
      check(p.expectedFloweringDate, 'Floração esperada', 'flower');
      check(p.expectedHarvestDate, 'Colheita esperada', 'harvest');
      check(p.floweringDate, 'Início floração', 'flower');
      check(p.harvestDate, 'Colheita', 'harvest');
      if (daysRemaining(p.seedDate) === 0) events.push({ p, label: 'Semeadura', type: 'seed', days: 0 });
    });
    return events.sort((a, b) => a.days - b.days);
  }, [plantings]);

  const handleDayPress = useCallback((day: DateData) => setSelectedDate(day.dateString), []);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('Excluir', `Remover "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deletePlanting(id) },
    ]);
  }, [deletePlanting]);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#2e7d32" /></View>;
  }

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          backgroundColor: '#fff',
          calendarBackground: '#fff',
          textSectionTitleColor: '#666',
          selectedDayBackgroundColor: '#2e7d32',
          selectedDayTextColor: '#fff',
          todayTextColor: '#2e7d32',
          dayTextColor: '#333',
          textDisabledColor: '#ddd',
          dotColor: '#2e7d32',
          selectedDotColor: '#fff',
          arrowColor: '#2e7d32',
          monthTextColor: '#2e7d32',
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        firstDay={1}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <LegendDot color="#4CAF50" label="Semeadura" />
        <LegendDot color="#E91E63" label="Floração" />
        <LegendDot color="#FF9800" label="Colheita" />
      </View>

      <ScrollView style={styles.details}>
        {/* Selected day */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 {formatDate(selectedDate)}</Text>
            {selectedPlantings.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum evento nesta data</Text>
            ) : (
              selectedPlantings.map((p) => (
                <View key={p.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>
                      {stageIcon(p.currentStage)} {p.strainName}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(p.id, p.strainName)} style={styles.delBtn}>
                      <Text style={styles.delBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.stageBadge}>
                    <Text style={{ color: stageColor(p.currentStage) }}>● </Text>
                    {p.currentStage} · {p.genetics.toUpperCase().slice(0, 3)} {p.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}
                  </Text>
                  <View style={styles.datesRow}>
                    <Text style={styles.dateText}>Semente: {formatDate(p.seedDate)}</Text>
                    {p.floweringDate && <Text style={styles.dateText}>Floração: {formatDate(p.floweringDate)}</Text>}
                    {p.harvestDate && <Text style={styles.dateText}>Colheita: {formatDate(p.harvestDate)}</Text>}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Upcoming */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📋 Próximos 45 dias ({upcomingEvents.length} eventos)
          </Text>
          {upcomingEvents.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum evento próximo</Text>
          ) : (
            upcomingEvents.map((evt, i) => (
              <View key={`${evt.p.id}-${evt.type}-${i}`} style={styles.eventItem}>
                <View style={[styles.eventBadge, { backgroundColor: evt.type === 'flower' ? '#fce4ec' : '#fff3e0' }]}>
                  <Text style={styles.eventBadgeText}>
                    {evt.type === 'flower' ? '🌺 FLORAÇÃO' : '✂️ COLHEITA'}
                  </Text>
                </View>
                <Text style={styles.eventName}>{evt.p.strainName}</Text>
                <Text style={styles.eventDays}>
                  {evt.days === 0 ? 'Hoje!' : `${evt.days}d`}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  legend: {
    flexDirection: 'row', justifyContent: 'center', paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: '#666' },
  details: { flex: 1, paddingHorizontal: 14, paddingTop: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#2e7d32', marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#999', fontStyle: 'italic', padding: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#e8e8e8',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: '600', color: '#333' },
  delBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
  delBtnText: { color: '#dc2626', fontSize: 14, fontWeight: 'bold' },
  stageBadge: { fontSize: 13, color: '#666', marginTop: 4, fontWeight: '500' },
  datesRow: { marginTop: 6, gap: 4 },
  dateText: { fontSize: 13, color: '#888' },
  eventItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#eee',
  },
  eventBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 10 },
  eventBadgeText: { fontSize: 10, fontWeight: '700' },
  eventName: { flex: 1, fontSize: 15, color: '#333' },
  eventDays: { fontSize: 13, fontWeight: '600', color: '#2e7d32' },
});

export default CalendarScreen;
