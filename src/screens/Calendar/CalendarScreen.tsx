import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Calendar, type DateData, LocaleConfig } from 'react-native-calendars';
import { differenceInDays, format, parseISO, isValid, addDays, isBefore, eachDayOfInterval, startOfDay } from 'date-fns';
import { usePlants } from '../../context/PlantContext';
import { useSettings } from '../../context/SettingsContext';
import { daysRemaining, plantDisplayName as plantDisplayNameDefault } from '../../utils/dateUtils';
import { loadAllJournalEntries } from '../../data/journalStorage';
import type { PlantJournalEntry } from '../../types/planting';
import TopHeader from '../../components/TopHeader';
import i18n from '../../i18n';
import { getCalendarLocale, configureCalendarLocale } from './localeConfig';
import { CalendarLegend } from './CalendarLegend';
import { EventsList, UpcomingList } from './EventsList';
import { STAGE_TO_DOT, ENTRY_TO_DOT, ENTRY_CONFIG } from './constants';
import { styles } from './styles';

let _selectedDateCache = '';

const CalendarScreen: React.FC = () => {
  const { plantings, loading, deletePlanting } = usePlants();
  const { formatDate: fmtDate, formatTime: fmtTime } = useSettings();
  const theme = useTheme();
  const { t } = useTranslation();
  const plantDisplayName = (p: Parameters<typeof plantDisplayNameDefault>[0]) =>
    plantDisplayNameDefault(p, fmtDate);

  // Sync calendar locale with current i18n language
  const currentLang = i18n.language || 'en';
  const calendarLocale = getCalendarLocale(currentLang);
  LocaleConfig.defaultLocale = calendarLocale;

  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(() => _selectedDateCache || todayStr);

  const [journalEntries, setJournalEntries] = useState<PlantJournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(true);

  useEffect(() => {
    loadAllJournalEntries().then((entries) => {
      setJournalEntries(entries);
      setJournalLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (_selectedDateCache) setSelectedDate(_selectedDateCache);
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
    const selColor = theme.colors.primary;
    const isTodaySelected = selectedDate === todayISO;

    // Today: highlight when not selected
    if (marks[todayISO]) {
      marks[todayISO].selected = isTodaySelected;
      marks[todayISO].selectedColor = selColor;
    } else {
      marks[todayISO] = { selected: isTodaySelected, selectedColor: selColor, dots: [] };
    }

    // Selected day: filled circle highlight
    if (selectedDate && !isTodaySelected) {
      if (marks[selectedDate]) {
        marks[selectedDate].selected = true;
        marks[selectedDate].selectedColor = selColor;
      } else {
        marks[selectedDate] = { selected: true, selectedColor: selColor, dots: [] };
      }
    }

    return marks;
  }, [plantings, journalEntries, selectedDate, theme.colors.primary]);

  // Selected day events grouped by plant
  const selectedDayByPlant = useMemo(() => {
    if (!selectedDate) return [];

    const groups: Array<{
      displayName: string;
      plantingId: string;
      ageLabel?: string;
      events: Array<{ label: string; icon: string; color: string; detail?: string; time?: string }>;
    }> = [];

    const getGroup = (displayName: string, plantingId: string, ageLabel?: string) => {
      let g = groups.find((g) => g.plantingId === plantingId);
      if (!g) {
        g = { displayName, plantingId, ageLabel, events: [] };
        groups.push(g);
      }
      return g;
    };

    plantings.forEach((p) => {
      const name = plantDisplayName(p);
      const add = (icon: string, label: string, color: string, detail?: string) => {
        // Calculate plant age: days from seedDate to selectedDate
        const seed = parseISO(p.seedDate);
        const sel = parseISO(selectedDate);
        if (isValid(seed) && isValid(sel)) {
          const ageDays = differenceInDays(sel, seed);
          const ageLabel = ageDays >= 0 ? `(${ageDays}d)` : `(${ageDays}d)`;
          getGroup(name, p.id, ageLabel).events.push({ label, icon, color, detail, time: undefined });
        } else {
          getGroup(name, p.id).events.push({ label, icon, color, detail, time: undefined });
        }
      };

      if (p.seedDate === selectedDate) add('🌱', t('stages.germination'), '#8BC34A', t('calendar.seedDate'));
      if (p.vegetativeDate === selectedDate) add('☘️', t('calendar.floweringStart'), '#2196F3');
      if (p.floweringDate === selectedDate) add('🌺', t('calendar.floweringStart'), '#E91E63');
      if (p.harvestDate === selectedDate) add('✂️', t('calendar.harvest'), '#795548');
    });

    journalEntries
      .filter((e) => entryDate(e) === selectedDate)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .forEach((e) => {
        const cfg = ENTRY_CONFIG[e.type] || { icon: '📝', label: e.type, color: '#666' };
        const plant = plantings.find((p) => p.id === e.plantingId);
        const name = plant ? plantDisplayName(plant) : t('plantings.emptyTitle');
        const g = getGroup(name, e.plantingId);
        // Add age label if not present
        if (plant && !g.ageLabel) {
          const seed = parseISO(plant.seedDate);
          const sel = parseISO(selectedDate);
          if (isValid(seed) && isValid(sel)) {
            const ageDays = differenceInDays(sel, seed);
            g.ageLabel = `${ageDays}d`;
          }
        }

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
        if (e.type === 'stage_change' && e.stageChange) {
          detail = `${e.stageChange.from} → ${e.stageChange.to}`;
        }
        g.events.push({ label: cfg.label, icon: cfg.icon, color: cfg.color, detail, time: entryTime(e) });
      });

    return groups;
  }, [selectedDate, plantings, journalEntries]);

  // Upcoming events — includes real dates + projected estimates
  const upcomingEvents = useMemo(() => {
    const events: Array<{ plantName: string; label: string; icon: string; color: string; days: number; projected?: boolean }> = [];
    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');

    plantings.forEach((p) => {
      const displayName = p.nickname || p.strainName;
      const check = (dateStr: string | null, label: string, icon: string, color: string, projected = false) => {
        if (!dateStr) return;
        const d = daysRemaining(dateStr);
        if (d >= 0 && d <= 45) events.push({ plantName: displayName, label, icon, color, days: d, projected });
      };

      // Real dates (set by stage changes)
      check(p.floweringDate, t('calendar.floweringStart'), '🌺', '#E91E63');
      check(p.harvestDate, t('calendar.harvest'), '✂️', '#795548');

      // Projected flowering: if not yet in flowering and no date set, estimate based on strain
      if (!p.floweringDate && p.currentStage !== 'floração' && p.currentStage !== 'secagem' && p.currentStage !== 'cura') {
        const seedDateParsed = parseISO(p.seedDate);
        if (isValid(seedDateParsed) && p.floweringDays > 0) {
          // Estimate: seedDate + floweringDays (for autos) or seedDate + ~30d veg + floweringDays (for photo)
          const vegDays = p.floweringType === 'photoperiodic' ? 30 : 0;
          const projectedFloweringDate = addDays(seedDateParsed, vegDays + p.floweringDays);
          check(format(projectedFloweringDate, 'yyyy-MM-dd'), t('calendar.floweringEst'), '🌺', '#E91E63', true);
        }
      }

      // Projected harvest: if not harvested yet, estimate from flowering
      if (!p.harvestDate && p.currentStage !== 'secagem' && p.currentStage !== 'cura') {
        const seedDateParsed = parseISO(p.seedDate);
        if (isValid(seedDateParsed) && p.floweringDays > 0) {
          // Estimate: floweringDate (or projected) + floweringDays
          const floweringBase = p.floweringDate
            ? parseISO(p.floweringDate)
            : addDays(seedDateParsed, p.floweringType === 'photoperiodic' ? 30 : 0);
          const projectedHarvestDate = addDays(floweringBase, p.floweringDays);
          check(format(projectedHarvestDate, 'yyyy-MM-dd'), t('calendar.harvestEst'), '📦', '#FF9800', true);
        }
      }

      // Show seedDate if it's today
      if (daysRemaining(p.seedDate) === 0) events.push({ plantName: displayName, label: t('calendar.seedDate'), icon: '🌱', color: '#8BC34A', days: 0 });
    });
    return events.sort((a, b) => a.days - b.days);
  }, [plantings]);

  const handleDayPress = useCallback((day: DateData) => {
    _selectedDateCache = day.dateString;
    setSelectedDate(day.dateString);
  }, []);

  const handleDelete = useCallback((id: string, p: typeof plantings[0]) => {
    Alert.alert(t('plantDetail.deleteTitle'), t('plantDetail.deleteMessage', { name: plantDisplayName(p) }), [
      { text: t('plantDetail.deleteCancel'), style: 'cancel' },
      { text: t('plantDetail.deleteConfirm'), style: 'destructive', onPress: () => deletePlanting(id) },
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
      <TopHeader title={t('calendar.title')} />
      <Calendar
        key={calendarLocale}
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
              🗓️ {selectedDate.split('-').reverse().join('/')}
            </Text>
            {selectedDayByPlant.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                {t('calendar.noEvents')}
              </Text>
            ) : (
              selectedDayByPlant.map((group) => (
                <View
                  key={group.plantingId}
                  style={[styles.plantCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
                >
                  <Text style={[styles.plantCardTitle, { color: theme.colors.primary }]}>
                    {group.displayName}{group.ageLabel ? ` ${group.ageLabel}` : ''}
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
            📋 {t('calendar.upcomingTitle')} ({upcomingEvents.length} eventos)
          </Text>
          <UpcomingList events={upcomingEvents} theme={theme} />
        </View>
      </ScrollView>
    </View>
  );
};

export default CalendarScreen;
