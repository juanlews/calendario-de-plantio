import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Alert, ActivityIndicator, Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePlants } from '../context/PlantContext';
import type { CannabisPlanting, PlantJournalEntry, JournalEntryType } from '../types/planting';
import { formatDate as formatDateDefault, daysRemaining, stageIcon, stageColor, stageLabel, daysInStage, plantDisplayName as plantDisplayNameDefault } from '../utils/dateUtils';
import { useSettings } from '../context/SettingsContext';
import { getStrainInfo } from '../data/strains';
import { loadJournalEntries, deleteJournalEntry } from '../data/journalStorage';

export type PlantDetailParamList = {
  PlantingsList: undefined;
  PlantDetail: { plantingId: string };
  AddJournalEntry: { plantingId: string; entryType?: JournalEntryType };
};

type Props = NativeStackScreenProps<PlantDetailParamList, 'PlantDetail'>;

const ENTRY_TYPE_CONFIG: Record<JournalEntryType, { icon: string; label: string; color: string }> = {
  photo: { icon: '📷', label: 'Foto', color: '#7B1FA2' },
  video: { icon: '🎥', label: 'Vídeo', color: '#C2185B' },
  comment: { icon: '💬', label: 'Comentário', color: '#1565C0' },
  watering: { icon: '💧', label: 'Rega', color: '#0288D1' },
  nutrition: { icon: '🧪', label: 'Nutrição', color: '#2E7D32' },
  pruning: { icon: '✂️', label: 'Poda', color: '#E65100' },
};

const PlantDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { plantings } = usePlants();
  const { plantingId } = route.params;
  const [entries, setEntries] = useState<PlantJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const planting = plantings.find((p) => p.id === plantingId);
  const { formatDate: fmtDate, formatTime: fmtTime } = useSettings();
  const displayName = planting ? (planting.nickname || planting.strainName) : '';
  const plantDisplayName = (p: Parameters<typeof plantDisplayNameDefault>[0]) =>
    plantDisplayNameDefault(p, fmtDate);
  const info = planting ? getStrainInfo(planting.strainName) : null;

  const loadEntries = useCallback(async () => {
    const result = await loadJournalEntries(plantingId);
    setEntries(result);
    setLoading(false);
  }, [plantingId]);

  useEffect(() => {
    loadEntries();
    // Refresh entries when returning from AddJournalEntry
    const unsub = navigation.addListener('focus', () => {
      loadEntries();
    });
    return unsub;
  }, [loadEntries, navigation]);

  if (!planting) {
    return (
      <View style={styles.center}>
        <Text>Planta não encontrada</Text>
      </View>
    );
  }


  const stage = planting.currentStage;
  const daysSinceSeed = daysRemaining(planting.seedDate) * -1;

  const handleDeleteEntry = (entry: PlantJournalEntry) => {
    Alert.alert('Excluir registro', `Remover este ${ENTRY_TYPE_CONFIG[entry.type].label}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteJournalEntry(entry.id);
          loadEntries();
        },
      },
    ]);
  };

  const handleDeletePlant = () => {
    Alert.alert(
      'Excluir planta',
      `Remover "${displayName}" e todos os seus registros?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir tudo',
          style: 'destructive',
          onPress: async () => {
            // Delete all journal entries for this plant
            for (const e of entries) {
              await deleteJournalEntry(e.id);
            }
            // Then delete the planting itself (via context)
            navigation.goBack();
          },
        },
      ],
    );
  };

  const quickActions: JournalEntryType[] = ['photo', 'video', 'watering', 'nutrition', 'pruning', 'comment'];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* ─── Plant Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.strainName}>{displayName}</Text>
            <TouchableOpacity onPress={handleDeletePlant} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: geneticsColor(planting.genetics) }]}>
              <Text style={styles.badgeText}>{planting.genetics.toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: planting.floweringType === 'autoflower' ? '#E65100' : '#455A64' }]}>
              <Text style={styles.badgeText}>{planting.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}</Text>
            </View>
            <View style={[styles.badge, styles.badgeStage, { borderColor: stageColor(stage) }]}>
              <Text style={[styles.badgeText, { color: stageColor(stage) }]}>
                {stageIcon(stage)} {stageLabel(stage)}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Info Grid ─── */}
        <View style={styles.infoGrid}>
          <InfoBlock label="🌱 Dias desde semente" value={`${Math.max(0, daysSinceSeed)}d`} />
          <InfoBlock label={`📅 ${stageLabel(stage)}`} value={String(daysInStage(planting.seedDate, planting.floweringDate))} />
          <InfoBlock label="🌺 Dias floração" value={planting.floweringDays > 0 ? `${planting.floweringDays}d` : '—'} />
          <InfoBlock label="🔬 THC" value={info ? `${info.thcMin}–${info.thcMax}%` : '—'} />
          <InfoBlock label="📦 Qty" value={planting.quantity > 1 ? `${planting.quantity} plantas` : '1 planta'} />
          <InfoBlock label="📅 Est. colheita" value={planting.expectedHarvestDate ? fmtDate(planting.expectedHarvestDate) : '—'} />
        </View>

        {planting.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>📝 Notas</Text>
            <Text style={styles.notesText}>{planting.notes}</Text>
          </View>
        )}

        {/* ─── Quick Actions ─── */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Registrar</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.actionBtn, { borderColor: ENTRY_TYPE_CONFIG[type].color + '44' }]}
                onPress={() =>
                  navigation.navigate('AddJournalEntry', { plantingId, entryType: type })
                }
              >
                <Text style={styles.actionIcon}>{ENTRY_TYPE_CONFIG[type].icon}</Text>
                <Text style={[styles.actionLabel, { color: ENTRY_TYPE_CONFIG[type].color }]}>
                  {ENTRY_TYPE_CONFIG[type].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Timeline ─── */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>
            📋 Diário ({entries.length})
          </Text>
          {loading ? (
            <ActivityIndicator style={styles.loader} size="small" color="#2e7d32" />
          ) : entries.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>Nenhum registro ainda</Text>
              <Text style={styles.emptySub}>Use os botões acima para registrar rega, nutrição, poda, fotos ou comentários</Text>
            </View>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <JournalEntryCard entry={item} isLast={index === entries.length - 1} onDelete={() => handleDeleteEntry(item)} />
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Journal Entry Card ───

const JournalEntryCard: React.FC<{ entry: PlantJournalEntry; isLast: boolean; onDelete: () => void }> = ({ entry, isLast, onDelete }) => {
  const config = ENTRY_TYPE_CONFIG[entry.type];
  const { formatDate: fmtDate, formatTime: fmtTime } = useSettings();
  const dateStr = fmtDate(entry.timestamp);
  const timeStr = fmtTime(entry.timestamp);

  return (
    <View style={styles.entryWrapper}>
      {/* Timeline dot + line */}
      <View style={styles.timelineLine}>
        <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
        {!isLast && <View style={styles.timelineBar} />}
      </View>

      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryHeaderLeft}>
            <Text style={styles.entryIcon}>{config.icon}</Text>
            <Text style={[styles.entryType, { color: config.color }]}>{config.label}</Text>
          </View>
          <View style={styles.entryHeaderRight}>
            <Text style={styles.entryTime}>{timeStr}</Text>
            <TouchableOpacity onPress={onDelete} style={styles.entryDelBtn}>
              <Text style={styles.entryDelText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Type-specific content */}
        {entry.type === 'watering' && entry.watering && (
          <View style={styles.entryData}>
            {entry.watering.volumeMl && <DataItem label="Volume" value={`${entry.watering.volumeMl}ml`} />}
            {entry.watering.ph != null && <DataItem label="pH" value={`${entry.watering.ph}`} />}
            {entry.watering.method && <DataItem label="Método" value={entry.watering.method} />}
            {entry.watering.runoff && <DataItem label="Runoff" value="Sim" />}
          </View>
        )}

        {entry.type === 'nutrition' && entry.nutrition && (
          <View style={styles.entryData}>
            <DataItem label="Produto" value={entry.nutrition.product} />
            <DataItem label="Dose" value={`${entry.nutrition.doseMlPerL} ml/L`} />
            {entry.nutrition.ph != null && <DataItem label="pH" value={`${entry.nutrition.ph}`} />}
            {entry.nutrition.ec != null && <DataItem label="EC" value={`${entry.nutrition.ec}`} />}
            {entry.nutrition.type && <DataItem label="Tipo" value={entry.nutrition.type} />}
          </View>
        )}

        {entry.type === 'pruning' && entry.pruning && (
          <View style={styles.entryData}>
            <DataItem label="Método" value={entry.pruning.method} />
            {entry.pruning.details && <DataItem label="Detalhes" value={entry.pruning.details} />}
          </View>
        )}

        {entry.type === 'photo' && entry.mediaUri && (
          <Image source={{ uri: entry.mediaUri }} style={styles.entryImage} />
        )}

        {entry.type === 'video' && entry.mediaUri && (
          <View style={styles.entryVideoPlaceholder}>
            <Text style={styles.entryVideoIcon}>🎬</Text>
            <Text style={styles.entryVideoText}>Vídeo salvo</Text>
          </View>
        )}

        {entry.note && <Text style={styles.entryNote}>{entry.note}</Text>}

        <Text style={styles.entryDate}>{dateStr}</Text>
      </View>
    </View>
  );
};

const DataItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.dataItem}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value}</Text>
  </View>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.infoValue}>{value}</Text>
    <Text style={styles.infoLabel}>{label}</Text>
  </View>
);

const geneticsColor = (g: string) => {
  switch (g) {
    case 'indica': return '#7B1FA2';
    case 'sativa': return '#1565C0';
    default: return '#2E7D32';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loader: { marginVertical: 20 },

  // Header
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strainName: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', flex: 1 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 18 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  badgeStage: { backgroundColor: '#fff', borderWidth: 1 },

  // Info grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', padding: 16, gap: 12 },
  infoBlock: { width: '30%', alignItems: 'center', marginBottom: 8 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  infoLabel: { fontSize: 10, color: '#888', marginTop: 2, textAlign: 'center' },

  // Notes
  notesCard: { backgroundColor: '#fff', padding: 16, marginTop: 1 },
  notesLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 4 },
  notesText: { fontSize: 14, color: '#333', lineHeight: 20 },

  // Quick actions
  actionsSection: { backgroundColor: '#fff', padding: 16, marginTop: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    flex: 1, minWidth: 90, padding: 12, borderRadius: 10,
    backgroundColor: '#fafafa', borderWidth: 1, alignItems: 'center',
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '600' },

  // Timeline
  timelineSection: { padding: 16 },
  emptyTimeline: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#666' },
  emptySub: { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 4, maxWidth: 260 },

  // Entry card
  entryWrapper: { flexDirection: 'row', marginBottom: 2 },
  timelineLine: { width: 28, alignItems: 'center', paddingTop: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineBar: { flex: 1, width: 2, backgroundColor: '#e0e0e0', marginTop: 2 },
  entryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12,
    marginLeft: 4, marginBottom: 10, borderWidth: 1, borderColor: '#e8e8e8',
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entryHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  entryIcon: { fontSize: 16, marginRight: 6 },
  entryType: { fontSize: 13, fontWeight: '700' },
  entryHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryTime: { fontSize: 12, color: '#999' },
  entryDelBtn: { padding: 4 },
  entryDelText: { fontSize: 14, color: '#ccc', fontWeight: '700' },
  entryData: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  dataItem: { backgroundColor: '#f8f8f8', borderRadius: 6, padding: 6, paddingHorizontal: 10 },
  dataLabel: { fontSize: 10, color: '#999', fontWeight: '500' },
  dataValue: { fontSize: 13, color: '#333', fontWeight: '600' },
  entryImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  entryVideoPlaceholder: {
    width: '100%', height: 100, borderRadius: 8, marginBottom: 8,
    backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center',
  },
  entryVideoIcon: { fontSize: 32 },
  entryVideoText: { fontSize: 13, color: '#fff', marginTop: 4 },
  entryNote: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 6 },
  entryDate: { fontSize: 11, color: '#bbb', marginTop: 2 },
});

export default PlantDetailScreen;
