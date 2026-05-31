import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { Calendar, type DateData } from 'react-native-calendars';
import { format, parseISO, isValid, addDays, isBefore, eachDayOfInterval, startOfDay } from 'date-fns';
import { usePlants } from '../../context/PlantContext';
import { useSettings } from '../../context/SettingsContext';
import { daysRemaining, plantDisplayName as plantDisplayNameDefault, toLocalIsoDate } from '../../utils/dateUtils';
import { loadAllJournalEntries } from '../../data/journalStorage';
import type { PlantJournalEntry } from '../../types/planting';
import TopHeader from '../../components/TopHeader';
import { CalendarLegend } from './CalendarLegend';
import { EventsList, UpcomingList } from './EventsList';
import { STAGE_TO_DOT, ENTRY_TO_DOT, ENTRY_CONFIG } from './constants';
import { styles } from './styles';

// Shared state across screen remounts
let sharedSelectedDate: string = '';

const CalendarScreen: React.FC = () => {
  const { plantings, loading, deletePlanting } = usePlants();
  const { formatDate: fmtDate, formatTime: fmtTime } = useSettings();
  const theme = useTheme();
  const plantDisplayName = (p: Parameters<typeof plantDisplayNameDefault>[0]) =>
    plantDisplayNameDefault(p, fmtDate);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Restore persisted selection, or default to today on first open
    const today = toLocalIsoDate(new Date());
    if (sharedSelectedDate) {
      // Validate it still makes sense (not stale by more than a day)
      const parsed = parseISO(sharedSelectedDate);
      if (isValid(parsed)) {
        return sharedSelectedDate;
      }
    }
    return today;
  });
  const initialized = useRef(false);
  const [journalEntries, setJournalEntries] = useState<PlantJournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(true);

  useEffect(() => {
    loadAllJournalEntries().then((entries) => {
      setJournalEntries(entries);
      setJournalLoading(false);
    });
  }, []);

  // On first mount and on focus, set selectedDate to today if not yet set
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const today = toLocalIsoDate(new Date());
      // Only auto-select today if the shared value is empty or invalid
      if (!sharedSelectedDate || !isValid(parseISO(sharedSelectedDate))) {
        sharedSelectedDate = today;
        setSelectedDate(today);
      }
    }
  }, []);

  // Restore shared selection when navigating back to this screen
  useFocusEffect(
    useCallback(() => {
      if (sharedSelectedDate && isValid(parseISO(sharedSelectedDate))) {
        setSelectedDate(sharedSelectedDate);
      }
    }, [])
  );

  const entryDate = (e: PlantJournalEntry): string => e.timestamp.split('T')[0];
  const entryTime = (e: PlantJournalEntry): string => fmtTime(e.timestamp);

  // Build calendar marks
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const todayDate = startOfDay(new Date());

    const addDot = (dateStr: string, key: string, color: string) => {
      if (!marks[dateStr]) marks[dateStr] = { dots: [], marked: true };
      if (!marks[dateStr].dots.find((d: any) => d.key === key)) {
        marks[dateStr].dots.push({ key, color });
      }
    };

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

    plantings.forEach((p) => {
      const seed = parseISO(p.seedDate);
      if (!isValid(seed)) return;

      const germinEnd = addDays(seed, 7);
      const mudaEnd = addDays(seed, 21);
      const todayISO = format(todayDate, 'yyyy-MM-dd');
      const vegStartDate = p.vegetativeDate || p.floweringDate || todayISO;
      const flowerStartDate = p.floweringDate || todayISO;

      const germEndActual = isBefore(germinEnd, todayDate) ? format(germinEnd, 'yyyy-MM-dd') : todayISO;
      const germClamped = isBefore(parseISO(vegStartDate), parseISO(germEndActual)) ? vegStartDate : germEndActual;
      markRange(p.seedDate, germClamped, 'germinação');

      const mudaStartStr = format(germinEnd, 'yyyy-MM-dd');
      if (!isBefore(parseISO(mudaStartStr), todayDate)) {
        const mudaEndActual = isBefore(mudaEnd, todayDate) ? format(mudaEnd, 'yyyy-MM-dd') : todayISO;
        const mudaClamped = isBefore(parseISO(vegStartDate), parseISO(mudaEndActual)) ? vegStartDate : mudaEndActual;
        if (!isBefore(parseISO(mudaClamped), parseISO(mudaStartStr))) {
          markRange(mudaStartStr, mudaClamped, 'muda');
        }
      }

      const vegStartActual = p.vegetativeDate || format(mudaEnd, 'yyyy-MM-dd');
      if (!isBefore(parseISO(flowerStartDate), parseISO(vegStartActual))) {
        markRange(vegStartActual, flowerStartDate, 'vegetativo');
      }

      if (p.floweringDate) {
        const harvestActual = p.harvestDate || todayISO;
        if (!isBefore(parseISO(harvestActual), parseISO(p.floweringDate))) {
          markRange(p.floweringDate, harvestActual, 'floração');
        }
      }

      if (p.harvestDate) {
        markRange(p.harvestDate, format(addDays(parseISO(p.harvestDate), 14), 'yyyy-MM-dd'), 'secagem');
        markRange(
          format(addDays(parseISO(p.harvestDate), 14), 'yyyy-MM-dd'),
          format(addDays(parseISO(p.harvestDate), 35), 'yyyy-MM-dd'),
          'cura'
        );
      }

    });

    journalEntries.forEach((entry) => {
      const dateStr = entryDate(entry);
      const dot = ENTRY_TO_DOT[entry.type];
      if (!dot) return;
      if (!marks[dateStr]) marks[dateStr] = { dots: [], marked: true };
      if (!marks[dateStr].dots.find((d: any) => d.key === dot.key)) {
        marks[dateStr].dots.push({ key: dot.key, color: dot.color });
      }
    });

    const todayISO = format(todayDate, 'yyyy-MM-dd');
    const todaySelectedColor = theme.colors.primary;
    if (marks[todayISO]) {
      marks[todayISO].selected = true;
      marks[todayISO].selectedColor = todaySelectedColor;
    } else {
      marks[todayISO] = { selected: true, selectedColor: todaySelectedColor, dots: [] };
    }

    return marks;
  }, [plantings, journalEntries, theme.colors.primary]);

  // Selected day events grouped by plant
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

    plantings.forEach((p) => {
      const name = plantDisplayName(p);
      const add = (icon: string, label: string, color: string, detail?: string) =>
        getGroup(name, p.id).events.push({ label, icon, color, detail, time: undefined });

      if (p.seedDate === selectedDate) add('🌱', 'Germinação', '#8BC34A', 'Semente plantada');
      if (p.vegetativeDate === selectedDate) add('☘️', 'Início Vegetativo', '#2196F3');
      if (p.floweringDate === selectedDate) add('🌺', 'Início Floração', '#E91E63');
      if (p.harvestDate === selectedDate) add('✂️', 'Colheita', '#795548');
    });

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

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    const events: Array<{ plantName: string; label: string; icon: string; color: string; days: number }> = [];
    plantings.forEach((p) => {
      const displayName = p.nickname || p.strainName;
      const check = (dateStr: string | null, label: string, icon: string, color: string) => {
        if (!dateStr) return;
        const d = daysRemaining(dateStr);
        if (d >= 0 && d <= 45) events.push({ plantName: displayName, label, icon, color, days: d });
      };
      check(p.floweringDate, 'Início floração', '🌺', '#E91E63');
      check(p.harvestDate, 'Colheita', '✂️', '#795548');
      if (daysRemaining(p.seedDate) === 0) events.push({ plantName: displayName, label: 'Semeadura', icon: '🌱', color: '#8BC34A', days: 0 });
    });
    return events.sort((a, b) => a.days - b.days);
  }, [plantings]);

  const handleDayPress = useCallback((day: DateData) => {
    // Use local date from the timestamp to avoid UTC off-by-one
    const localDate = toLocalIsoDate(new Date(day.year, day.month - 1, day.day));
    sharedSelectedDate = localDate;
    setSelectedDate(localDate);
  }, []);

  const handleDelete = useCallback((id: string, p: typeof plantings[0]) => {
    Alert.alert('Excluir', `Remover "${plantDisplayName(p)}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deletePlanting(id) },
    ]);
  }, [deletePlanting, fmtDate]);

  if (loading || journalLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopHeader title="Calendário" />
      <Calendar
        key={`${theme.dark ? 'd' : 'l'}-${theme.colors.primary}`}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          backgroundColor: theme.colors.surface,
          calendarBackground: theme.colors.surface,
          textSectionTitleColor: theme.colors.onSurfaceVariant,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.onPrimary,
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.onSurface,
          textDisabledColor: theme.colors.onSurfaceDisabled ?? '#ddd',
          dotColor: theme.colors.primary,
          selectedDotColor: theme.colors.onPrimary,
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.onSurface,
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        firstDay={1}
      />

      <CalendarLegend theme={theme} />

      <ScrollView style={[styles.details, { backgroundColor: theme.colors.background }]}>
        {selectedDate && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              🗓️ {fmtDate(selectedDate)}
            </Text>
            {selectedDayByPlant.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                Nenhum evento nesta data
              </Text>
            ) : (
              selectedDayByPlant.map((group) => (
                <View
                  key={group.plantingId}
                  style={[styles.plantCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
                >
                  <Text style={[styles.plantCardTitle, { color: theme.colors.primary }]}>
                    {group.displayName}
                  </Text>
                  <EventsList
                    events={group.events}
                    loading={journalLoading}
                    theme={theme}
                  />
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            📋 Próximos 45 dias ({upcomingEvents.length} eventos)
          </Text>
          <UpcomingList events={upcomingEvents} theme={theme} />
        </View>
      </ScrollView>
    </View>
  );
};

export default CalendarScreen;
