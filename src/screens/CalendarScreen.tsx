import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { format, parseISO, isValid, addDays, isBefore, eachDayOfInterval, startOfDay } from 'date-fns';
import { usePlants } from '../context/PlantContext';
import { useSettings } from '../context/SettingsContext';
import { formatDate as formatDateDefault, daysRemaining, dateStatus, stageIcon, stageColor, stageLabel, plantDisplayName as plantDisplayNameDefault } from '../utils/dateUtils';
import { loadAllJournalEntries } from '../data/journalStorage';
import type { PlantJournalEntry, GrowthStage } from '../types/planting';

// ─── GrowthStage config ───
const STAGE_CONFIG: Record<GrowthStage, { icon: string; label: string; color: string }> = {
  'germinação': { icon: '🌱', label: 'Germinação', color: '#8BC34A' },
  'muda': { icon: '🌿', label: 'Muda', color: '#4CAF50' },
  'vegetativo': { icon: '☘️', label: 'Vegetativo', color: '#2196F3' },
  'floração': { icon: '🌺', label: 'Floração', color: '#E91E63' },
  'secagem': { icon: '🍂', label: 'Secagem', color: '#795548' },
  'cura': { icon: '🫙', label: 'Cura', color: '#FF9800' },
};

// ─── Journal entry type config ───
const ENTRY_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  watering: { icon: '💧', label: 'Rega', color: '#0288D1' },
  nutrition: { icon: '🧪', label: 'Nutrição', color: '#2E7D32' },
  pruning: { icon: '✂️', label: 'Poda', color: '#E65100' },
  photo: { icon: '📷', label: 'Foto', color: '#7B1FA2' },
  video: { icon: '🎥', label: 'Vídeo', color: '#C2185B' },
  comment: { icon: '💬', label: 'Comentário', color: '#1565C0' },
};

// Dot keys — mapeados para cores únicas no calendário
const STAGE_TO_DOT: Record<GrowthStage, { key: string; color: string }> = {
  'germinação': { key: 'germinação', color: '#8BC34A' },
  'muda': { key: 'muda', color: '#4CAF50' },
  'vegetativo': { key: 'vegetativo', color: '#2196F3' },
  'floração': { key: 'floração', color: '#E91E63' },
  'secagem': { key: 'secagem', color: '#795548' },
  'cura': { key: 'cura', color: '#FF9800' },
};

const ENTRY_TO_DOT: Record<string, { key: string; color: string }> = {
  watering: { key: 'watering', color: '#0288D1' },
  nutrition: { key: 'nutrition', color: '#2E7D32' },
  pruning: { key: 'pruning', color: '#E65100' },
  photo: { key: 'photo', color: '#7B1FA2' },
  video: { key: 'video', color: '#C2185B' },
  comment: { key: 'comment', color: '#1565C0' },
};

const CalendarScreen = () => {
  const { plantings, loading, updateStage, deletePlanting } = usePlants();
  const { formatDate: fmtDate, formatTime: fmtTime } = useSettings();
  const plantDisplayName = (p: Parameters<typeof plantDisplayNameDefault>[0]) =>
    plantDisplayNameDefault(p, fmtDate);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [journalEntries, setJournalEntries] = useState<PlantJournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(true);

  // Load journal entries
  useEffect(() => {
    loadAllJournalEntries().then((entries) => {
      setJournalEntries(entries);
      setJournalLoading(false);
    });
  }, []);

  // Helper: get date string from ISO timestamp
  const entryDate = (e: PlantJournalEntry): string => e.timestamp.split('T')[0];
  // Helper: get time string from ISO timestamp using settings
  const entryTime = (e: PlantJournalEntry): string => fmtTime(e.timestamp);

  // Build calendar marks
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const todayDate = startOfDay(new Date());

    // Helper: add dot to a date, avoiding duplicates
    const addDot = (dateStr: string, key: string, color: string) => {
      if (!marks[dateStr]) marks[dateStr] = { dots: [], marked: true };
      if (!marks[dateStr].dots.find((d: any) => d.key === key)) {
        marks[dateStr].dots.push({ key, color });
      }
    };

    // Helper: mark a date range with a stage dot
    const markRange = (startStr: string, endStr: string, stage: keyof typeof STAGE_TO_DOT) => {
      const start = startOfDay(parseISO(startStr));
      if (!isValid(start)) return;
      const end = startOfDay(parseISO(endStr));
      if (isBefore(end, start)) return;
      const dot = STAGE_TO_DOT[stage];
      eachDayOfInterval({ start, end }).forEach((d) =>
        addDot(format(d, 'yyyy-MM-dd'), dot.key, dot.color)
      );
    };

    // Plant stage events — mark the FULL period of each stage
    plantings.forEach((p) => {
      const seed = parseISO(p.seedDate);
      if (!isValid(seed)) return;

      const germinEnd = addDays(seed, 7);
      const mudaEnd = addDays(seed, 21);
      const todayISO = format(todayDate, 'yyyy-MM-dd');

      // Determine actual boundaries
      const vegStartDate = p.vegetativeDate || p.floweringDate || todayISO;
      const flowerStartDate = p.floweringDate || todayISO;

      // Germinação: seedDate → min(seed+7, vegetativeDate, floweringDate, today)
      const germEndActual = isBefore(germinEnd, todayDate) ? format(germinEnd, 'yyyy-MM-dd') : todayISO;
      const germClamped = isBefore(parseISO(vegStartDate), parseISO(germEndActual)) ? vegStartDate : germEndActual;
      markRange(p.seedDate, germClamped, 'germinação');

      // Muda: seed+7 → min(seed+21, vegetativeDate, floweringDate, today)
      const mudaStartStr = format(germinEnd, 'yyyy-MM-dd');
      if (!isBefore(parseISO(mudaStartStr), todayDate)) {
        const mudaEndActual = isBefore(mudaEnd, todayDate) ? format(mudaEnd, 'yyyy-MM-dd') : todayISO;
        const mudaClamped = isBefore(parseISO(vegStartDate), parseISO(mudaEndActual)) ? vegStartDate : mudaEndActual;
        if (!isBefore(parseISO(mudaClamped), parseISO(mudaStartStr))) {
          markRange(mudaStartStr, mudaClamped, 'muda');
        }
      }

      // Vegetativo: vegetativeDate (or seed+21) → floweringDate or today
      const vegStartActual = p.vegetativeDate || format(mudaEnd, 'yyyy-MM-dd');
      if (!isBefore(parseISO(flowerStartDate), parseISO(vegStartActual))) {
        markRange(vegStartActual, flowerStartDate, 'vegetativo');
      }

      // Floração: floweringDate → harvestDate or today
      if (p.floweringDate) {
        const harvestActual = p.harvestDate || todayISO;
        if (!isBefore(parseISO(harvestActual), parseISO(p.floweringDate))) {
          markRange(p.floweringDate, harvestActual, 'floração');
        }
      }

      // Secagem: harvestDate → harvestDate+14
      if (p.harvestDate) {
        markRange(p.harvestDate, format(addDays(parseISO(p.harvestDate), 14), 'yyyy-MM-dd'), 'secagem');
        // Cura: harvestDate+14 → harvestDate+35
        markRange(
          format(addDays(parseISO(p.harvestDate), 14), 'yyyy-MM-dd'),
          format(addDays(parseISO(p.harvestDate), 35), 'yyyy-MM-dd'),
          'cura'
        );
      }

      // Expected flowering - purple (single day marker)
      if (p.expectedFloweringDate) addDot(p.expectedFloweringDate, 'exp-flower', '#9C27B0');

      // Expected harvest - orange (single day marker)
      if (p.expectedHarvestDate) addDot(p.expectedHarvestDate, 'exp-harvest', '#FF9800');
    });

    // Journal entries → mark their dates
    journalEntries.forEach((entry) => {
      const dateStr = entryDate(entry);
      const dot = ENTRY_TO_DOT[entry.type];
      if (!dot) return;
      if (!marks[dateStr]) marks[dateStr] = { dots: [], marked: true };
      if (!marks[dateStr].dots.find((d: any) => d.key === dot.key)) {
        marks[dateStr].dots.push({ key: dot.key, color: dot.color });
      }
    });

    // Today highlight
    const todayISO = format(todayDate, 'yyyy-MM-dd');
    if (marks[todayISO]) {
      marks[todayISO].selected = true;
      marks[todayISO].selectedColor = '#2e7d32';
    } else {
      marks[todayISO] = { selected: true, selectedColor: '#2e7d32', dots: [] };
    }

    return marks;
  }, [plantings, journalEntries]);

  // Selected day: events grouped by plant
  const selectedDayByPlant = useMemo(() => {
    if (!selectedDate) return [];

    const groups: Array<{
      displayName: string;
      plantingId: string;
      events: Array<{ label: string; icon: string; color: string; detail?: string; time?: string }>;
    }> = [];

    const getGroup = (displayName: string, plantingId: string) => {
      let g = groups.find((g) => g.plantingId === plantingId);
      if (!g) {
        g = { displayName, plantingId, events: [] };
        groups.push(g);
      }
      return g;
    };

    // Plant stage events on this date (no specific time, just date)
    plantings.forEach((p) => {
      const name = plantDisplayName(p);
      const add = (icon: string, label: string, color: string, detail?: string) =>
        getGroup(name, p.id).events.push({ label, icon, color, detail, time: undefined });

      if (p.seedDate === selectedDate) add('🌱', 'Germinação', '#8BC34A', 'Semente plantada');
      if (p.vegetativeDate === selectedDate) add('☘️', 'Início Vegetativo', '#2196F3');
      if (p.floweringDate === selectedDate) add('🌺', 'Início Floração', '#E91E63');
      if (p.harvestDate === selectedDate) add('✂️', 'Colheita', '#795548');
      if (p.expectedFloweringDate === selectedDate) add('🌸', 'Floração esperada', '#9C27B0');
      if (p.expectedHarvestDate === selectedDate) add('📦', 'Colheita esperada', '#FF9800');
    });

    // Journal entries on this date (sorted by time)
    journalEntries
      .filter((e) => entryDate(e) === selectedDate)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .forEach((e) => {
        const cfg = ENTRY_CONFIG[e.type] || { icon: '📝', label: e.type, color: '#666' };
        const plant = plantings.find((p) => p.id === e.plantingId);
        const name = plant ? plantDisplayName(plant) : 'Desconhecida';
        const g = getGroup(name, e.plantingId);

        let detail = e.note;
        if (e.type === 'watering' && e.watering) {
          detail = [
            e.watering.volumeMl ? `${e.watering.volumeMl}ml` : '',
            e.watering.ph ? `pH ${e.watering.ph}` : '',
            e.watering.method ? e.watering.method : '',
            e.watering.runoff ? 'com runoff' : '',
          ].filter(Boolean).join(' · ') || e.note;
        }
        if (e.type === 'nutrition' && e.nutrition) {
          detail = `${e.nutrition.product} · ${e.nutrition.doseMlPerL}ml/L` +
            (e.nutrition.type ? ` (${e.nutrition.type})` : '');
        }
        if (e.type === 'pruning' && e.pruning) {
          detail = e.pruning.method + (e.pruning.details ? ` — ${e.pruning.details}` : '');
        }
        g.events.push({ label: cfg.label, icon: cfg.icon, color: cfg.color, detail, time: entryTime(e) });
      });

    return groups;
  }, [selectedDate, plantings, journalEntries]);

  // Upcoming events (next 45 days)
  const upcomingEvents = useMemo(() => {
    const events: Array<{ plantName: string; label: string; icon: string; color: string; days: number }> = [];
    plantings.forEach((p) => {
      const displayName = p.nickname || p.strainName;
      const check = (dateStr: string | null, label: string, icon: string, color: string) => {
        if (!dateStr) return;
        const d = daysRemaining(dateStr);
        if (d >= 0 && d <= 45) events.push({ plantName: displayName, label, icon, color, days: d });
      };
      check(p.expectedFloweringDate, 'Floração esperada', '🌸', '#9C27B0');
      check(p.expectedHarvestDate, 'Colheita esperada', '📦', '#FF9800');
      check(p.floweringDate, 'Início floração', '🌺', '#E91E63');
      check(p.harvestDate, 'Colheita', '✂️', '#795548');
      if (daysRemaining(p.seedDate) === 0) events.push({ plantName: displayName, label: 'Semeadura', icon: '🌱', color: '#8BC34A', days: 0 });
    });
    return events.sort((a, b) => a.days - b.days);
  }, [plantings]);

  const handleDayPress = useCallback((day: DateData) => setSelectedDate(day.dateString), []);

  const handleDelete = useCallback((id: string, p: typeof plantings[0]) => {
    Alert.alert('Excluir', `Remover "${plantDisplayName(p)}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deletePlanting(id) },
    ]);
  }, [deletePlanting, fmtDate]);

  if (loading || journalLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#2e7d32" /></View>;
  }

  // Legend simplificada — categorias agrupadas
  const legendItems = [
    { icon: '🌱', label: 'Germinação', color: '#8BC34A' },
    { icon: '🌿', label: 'Muda', color: '#4CAF50' },
    { icon: '☘️', label: 'Vegetativo', color: '#2196F3' },
    { icon: '🌺', label: 'Floração', color: '#E91E63' },
    { icon: '🍂', label: 'Secagem', color: '#795548' },
    { icon: '🫙', label: 'Cura', color: '#FF9800' },
    { icon: '🌸', label: 'Flora esp.', color: '#9C27B0' },
    { icon: '📦', label: 'Colheita esp.', color: '#FF9800' },
    { icon: '💧', label: 'Rega', color: '#0288D1' },
    { icon: '✂️', label: 'Poda', color: '#E65100' },
    { icon: '🧪', label: 'Nutrição', color: '#2E7D32' },
    { icon: '📷', label: 'Foto', color: '#7B1FA2' },
    { icon: '💬', label: 'Comentário', color: '#1565C0' },
  ];

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

      {/* Legend — grouped categories */}
      <View style={styles.legend}>
        <View style={styles.legendGroup}>
          <Text style={styles.legendGroupTitle}>Estágios</Text>
          <View style={styles.legendRow}>
            {legendItems.slice(0, 8).map((item) => (
              <View key={item.label} style={styles.legendChip}>
                <Text style={{ fontSize: 11 }}>{item.icon}</Text>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.legendGroup}>
          <Text style={styles.legendGroupTitle}>Registros</Text>
          <View style={styles.legendRow}>
            {legendItems.slice(8).map((item) => (
              <View key={item.label} style={styles.legendChip}>
                <Text style={{ fontSize: 11 }}>{item.icon}</Text>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={styles.details}>
        {/* Selected day — grouped by plant */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 {fmtDate(selectedDate)}</Text>
            {selectedDayByPlant.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum evento nesta data</Text>
            ) : (
              selectedDayByPlant.map((group) => (
                <View key={group.plantingId} style={styles.plantCard}>
                  <Text style={styles.plantCardTitle}>{group.displayName}</Text>
                  {group.events.map((evt, i) => (
                    <View key={i} style={styles.eventRow}>
                      <View style={[styles.eventIconWrap, { backgroundColor: evt.color + '18' }]}>
                        <Text style={styles.eventIconText}>{evt.icon}</Text>
                      </View>
                      <View style={styles.eventInfo}>
                        <View style={styles.eventRowTop}>
                          <Text style={styles.eventLabel}>
                            <Text style={{ color: evt.color }}>{evt.label}</Text>
                          </Text>
                          {evt.time && <Text style={styles.eventTime}>{evt.time}</Text>}
                        </View>
                        {evt.detail && <Text style={styles.eventDetail}>{evt.detail}</Text>}
                      </View>
                    </View>
                  ))}
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
              <View key={`${evt.plantName}-${evt.label}-${i}`} style={styles.upcomingItem}>
                <View style={[styles.upcomingBadge, { backgroundColor: evt.color + '18' }]}>
                  <Text style={[styles.upcomingBadgeText, { color: evt.color }]}>
                    {evt.icon} {evt.label.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.upcomingName}>{evt.plantName}</Text>
                <Text style={styles.upcomingDays}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  legend: {
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
    paddingVertical: 8, paddingHorizontal: 10,
  },
  legendGroup: { marginBottom: 4 },
  legendGroupTitle: { fontSize: 10, fontWeight: '600', color: '#999', marginBottom: 4 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  legendChip: { flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 2 },
  legendDot: { width: 7, height: 7, borderRadius: 3, marginRight: 3 },
  legendText: { fontSize: 10, color: '#666' },
  details: { flex: 1, paddingHorizontal: 14, paddingTop: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#2e7d32', marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#999', fontStyle: 'italic', padding: 8 },

  // Plant grouping card
  plantCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e8e8e8', overflow: 'hidden' },
  plantCardTitle: { fontSize: 15, fontWeight: '700', color: '#2e7d32', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },

  // Event rows (inside plant card)
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 8 },
  eventIconWrap: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  eventIconText: { fontSize: 14 },
  eventInfo: { flex: 1 },
  eventRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  eventLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  eventTime: { fontSize: 11, color: '#aaa', fontWeight: '500', marginLeft: 8 },
  eventPlant: { fontSize: 12, color: '#666', fontWeight: '400' },
  eventDetail: { fontSize: 11, color: '#888', marginTop: 2 },

  // Upcoming events
  upcomingItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#eee',
  },
  upcomingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 10 },
  upcomingBadgeText: { fontSize: 9, fontWeight: '700' },
  upcomingName: { flex: 1, fontSize: 15, color: '#333' },
  upcomingDays: { fontSize: 13, fontWeight: '600', color: '#2e7d32' },
});

export default CalendarScreen;
