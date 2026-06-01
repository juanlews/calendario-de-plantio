import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PlantJournalEntry, JournalEntryType } from '../../types/planting';
import { useSettings } from '../../context/SettingsContext';
import { styles } from './shared';

const ENTRY_TYPE_CONFIG: Record<JournalEntryType, { icon: string; i18nKey: string; color: string }> = {
  photo: { icon: '📷', i18nKey: 'journal.photo', color: '#7B1FA2' },
  video: { icon: '🎥', i18nKey: 'journal.video', color: '#C2185B' },
  comment: { icon: '💬', i18nKey: 'journal.comment', color: '#1565C0' },
  watering: { icon: '💧', i18nKey: 'journal.watering', color: '#0288D1' },
  nutrition: { icon: '🧪', i18nKey: 'journal.nutrition', color: '#2E7D32' },
  pruning: { icon: '✂️', i18nKey: 'journal.pruning', color: '#E65100' },
  stage_change: { icon: '🔄', i18nKey: 'journal.stageChange', color: '#FF9800' },
};

interface Props {
  entries: PlantJournalEntry[];
  loading: boolean;
  onDeleteEntry: (entry: PlantJournalEntry) => void;
  theme: any;
}

export const JournalTimeline: React.FC<Props> = ({ entries, loading, onDeleteEntry, theme }) => {
  const { t } = useTranslation();

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="small" color={theme.colors.primary} />;
  }

  if (entries.length === 0) {
    return (
      <View style={styles.emptyTimeline}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          {t('calendar.noEvents')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item, index }) => (
        <JournalEntryCard
          entry={item}
          isLast={index === entries.length - 1}
          onDelete={() => onDeleteEntry(item)}
          theme={theme}
        />
      )}
    />
  );
};

const JournalEntryCard: React.FC<{
  entry: PlantJournalEntry;
  isLast: boolean;
  onDelete: () => void;
  theme: any;
}> = ({ entry, isLast, onDelete, theme }) => {
  const { t } = useTranslation();
  const config = ENTRY_TYPE_CONFIG[entry.type];
  const { formatDate, formatTime } = useSettings();
  const dateStr = formatDate(entry.timestamp);
  const timeStr = formatTime(entry.timestamp);

  return (
    <View style={styles.entryWrapper}>
      <View style={styles.timelineLine}>
        <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
        {!isLast && <View style={[styles.timelineBar, { backgroundColor: theme.colors.outlineVariant }]} />}
      </View>

      <View style={[styles.entryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <View style={styles.entryHeader}>
          <View style={styles.entryHeaderLeft}>
            <Text style={styles.entryIcon}>{config.icon}</Text>
            <Text style={[styles.entryType, { color: config.color }]}>{t(config.i18nKey)}</Text>
          </View>
          <View style={styles.entryHeaderRight}>
            <Text style={[styles.entryTime, { color: theme.colors.onSurfaceVariant }]}>{timeStr}</Text>
            <TouchableOpacity onPress={onDelete} style={styles.entryDelBtn}>
              <Text style={[styles.entryDelText, { color: theme.colors.outline }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {entry.type === 'watering' && entry.watering && (
          <View style={styles.entryData}>
            {entry.watering.volumeMl && <DataItem label={t('journal.waterAmount')} value={`${entry.watering.volumeMl}ml`} theme={theme} />}
            {entry.watering.ph != null && <DataItem label={t('journal.phLabel')} value={`${entry.watering.ph}`} theme={theme} />}
            {entry.watering.method && <DataItem label={t('journal.waterMethod')} value={t(`journal.${entry.watering.method === 'Top watering' ? 'methodTopWatering' : entry.watering.method === 'Bottom watering' ? 'methodBottomWatering' : entry.watering.method === 'Foliar spray' ? 'methodFoliar' : 'methodDrip'}`)} theme={theme} />}
            {entry.watering.runoff && <DataItem label={t('journal.runoff')} value={t('journal.yes')} theme={theme} />}
          </View>
        )}

        {entry.type === 'nutrition' && entry.nutrition && (
          <View style={styles.entryData}>
            <DataItem label={t('journal.nutrientBrand')} value={entry.nutrition.product} theme={theme} />
            <DataItem label={t('journal.nutrientDose')} value={`${entry.nutrition.doseMlPerL} ml/L`} theme={theme} />
            {entry.nutrition.ph != null && <DataItem label={t('journal.phLabel')} value={`${entry.nutrition.ph}`} theme={theme} />}
            {entry.nutrition.ec != null && <DataItem label={t('journal.ecLabel')} value={`${entry.nutrition.ec}`} theme={theme} />}
            {entry.nutrition.type && <DataItem label={t('journal.nutritionType')} value={entry.nutrition.type} theme={theme} />}
          </View>
        )}

        {entry.type === 'pruning' && entry.pruning && (
          <View style={styles.entryData}>
            <DataItem label={t('journal.pruningType')} value={t(`journal.${mapPruningMethod(entry.pruning.method)}`)} theme={theme} />
            {entry.pruning.details && <DataItem label={t('journal.pruneDetails') ?? 'Detalhes'} value={entry.pruning.details} theme={theme} />}
          </View>
        )}

        {entry.type === 'photo' && entry.mediaUri && (
          <Image
            source={{ uri: entry.mediaUri }}
            style={[styles.entryImage, { backgroundColor: theme.colors.elevation.level2 }]}
          />
        )}

        {entry.type === 'video' && entry.mediaUri && (
          <View style={[styles.entryVideoPlaceholder, { backgroundColor: theme.colors.inverseSurface }]}>
            <Text style={styles.entryVideoIcon}>🎬</Text>
            <Text style={[styles.entryVideoText, { color: theme.colors.inverseOnSurface }]}>
              {t('journal.video')}
            </Text>
          </View>
        )}

        {entry.note && (
          <Text style={[styles.entryNote, { color: theme.colors.onSurfaceVariant }]}>{entry.note}</Text>
        )}

        <Text style={[styles.entryDate, { color: theme.colors.outline }]}>{dateStr}</Text>
      </View>
    </View>
  );
};

function mapPruningMethod(method: string): string {
  const map: Record<string, string> = {
    'Topping': 'typeTopping',
    'FIM': 'typeFIM',
    'LST': 'typeLST',
    'Defoliation': 'typeDefoliation',
    'Lollipop': 'typeLollipop',
    'ScrOG': 'typeScrOG',
    'Super Cropping': 'typeSuperCropping',
  };
  return map[method] || 'typeTopping';
}

const DataItem: React.FC<{ label: string; value: string; theme: any }> = ({ label, value, theme }) => (
  <View style={[styles.dataItem, { backgroundColor: theme.colors.elevation.level1 }]}>
    <Text style={[styles.dataLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    <Text style={[styles.dataValue, { color: theme.colors.onSurface }]}>{value}</Text>
  </View>
);
