import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Alert, ActivityIndicator, Image, Platform, Modal, TextInput,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePlants } from '../context/PlantContext';
import type { CannabisPlanting, PlantJournalEntry, JournalEntryType, GrowthStage } from '../types/planting';
import { formatDate as formatDateDefault, daysRemaining, stageIcon, stageColor, stageLabel, daysInStage, plantDisplayName as plantDisplayNameDefault } from '../utils/dateUtils';
import { useSettings } from '../context/SettingsContext';
import { getStrainInfo } from '../data/strains';
import { loadJournalEntries, deleteJournalEntry } from '../data/journalStorage';
import TopHeader from '../components/TopHeader';

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

const GROWTH_STAGES: GrowthStage[] = ['germinação', 'muda', 'vegetativo', 'floração', 'secagem', 'cura'];

const PlantDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { plantings, updateCurrentStage } = usePlants();
  const theme = useTheme();
  const { plantingId } = route.params;
  const [entries, setEntries] = useState<PlantJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStageModal, setShowStageModal] = useState(false);

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
    const unsub = navigation.addListener('focus', () => {
      loadEntries();
    });
    return unsub;
  }, [loadEntries, navigation]);

  if (!planting) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onSurface }}>Planta não encontrada</Text>
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
            for (const e of entries) {
              await deleteJournalEntry(e.id);
            }
            navigation.goBack();
          },
        },
      ],
    );
  };

  const quickActions: JournalEntryType[] = ['photo', 'video', 'watering', 'nutrition', 'pruning', 'comment'];

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title={displayName} subtitle={`${stageIcon(stage)} ${stageLabel(stage)}`} showBack onBack={() => navigation.goBack()} rightAction={{ icon: 'trash-outline', onPress: handleDeletePlant }} />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* ─── Plant Header ─── */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.strainName, { color: theme.colors.onSurface }]}>{displayName}</Text>
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
            <View style={[styles.badge, styles.badgeStage, { borderColor: stageColor(stage), backgroundColor: stageColor(stage) + '18' }]}>
              <Text style={[styles.badgeText, { color: stageColor(stage) }]}>
                {stageIcon(stage)} {stageLabel(stage)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowStageModal(true)} style={styles.editStageBtn}>
              <Text style={styles.editStageBtnText}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Info Grid ─── */}
        <View style={[styles.infoGrid, { backgroundColor: theme.colors.surface }]}>
          <InfoBlock label="🌱 Dias desde semente" value={`${Math.max(0, daysSinceSeed)}d`} theme={theme} />
          <InfoBlock label={`🗓️ ${stageLabel(stage)}`} value={String(daysInStage(planting.seedDate, planting.floweringDate))} theme={theme} />
          <InfoBlock label="🌺 Dias floração" value={planting.floweringDays > 0 ? `${planting.floweringDays}d` : '—'} theme={theme} />
          <InfoBlock label="🔬 THC" value={info ? `${info.thcMin}–${info.thcMax}%` : '—'} theme={theme} />
          <InfoBlock label="📦 Qty" value={planting.quantity > 1 ? `${planting.quantity} plantas` : '1 planta'} theme={theme} />
          <InfoBlock label="🗓️ Est. colheita" value={planting.expectedHarvestDate ? fmtDate(planting.expectedHarvestDate) : '—'} theme={theme} />
        </View>

        {planting.notes && (
          <View style={[styles.notesCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.notesLabel, { color: theme.colors.onSurfaceVariant }]}>📝 Notas</Text>
            <Text style={[styles.notesText, { color: theme.colors.onSurface }]}>{planting.notes}</Text>
          </View>
        )}

        {/* ─── Quick Actions ─── */}
        <View style={[styles.actionsSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>⚡ Registrar</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.actionBtn, { borderColor: ENTRY_TYPE_CONFIG[type].color + '44', backgroundColor: theme.colors.elevation.level1 }]}
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
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📋 Diário ({entries.length})
          </Text>
          {loading ? (
            <ActivityIndicator style={styles.loader} size="small" color={theme.colors.primary} />
          ) : entries.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>Nenhum registro ainda</Text>
              <Text style={[styles.emptySub, { color: theme.colors.outline }]}>Use os botões acima para registrar rega, nutrição, poda, fotos ou comentários</Text>
            </View>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <JournalEntryCard entry={item} isLast={index === entries.length - 1} onDelete={() => handleDeleteEntry(item)} theme={theme} />
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* ─── Stage Edit Modal ─── */}
      <Modal visible={showStageModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Editar Estágio</Text>
              <TouchableOpacity onPress={() => setShowStageModal(false)} style={[styles.modalCloseBtn, { backgroundColor: theme.colors.elevation.level2 }]}>
                <Text style={[styles.modalCloseText, { color: theme.colors.onSurfaceVariant }]}>✕</Text>
              </TouchableOpacity>
            </View>
            {GROWTH_STAGES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.modalStageItem,
                  { borderBottomColor: theme.colors.outlineVariant },
                  stage === s && { backgroundColor: stageColor(s) + '18', borderColor: stageColor(s) },
                ]}
                onPress={() => {
                  updateCurrentStage(plantingId, s);
                  setShowStageModal(false);
                }}
              >
                <Text style={styles.modalStageIcon}>{stageIcon(s)}</Text>
                <Text style={[styles.modalStageLabel, { color: theme.colors.onSurface }, stage === s && { color: stageColor(s), fontWeight: '700' }]}>
                  {stageLabel(s)}
                </Text>
                {stage === s && <Text style={[styles.modalStageCheck, { color: theme.colors.primary }]}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Journal Entry Card ───

const JournalEntryCard: React.FC<{ entry: PlantJournalEntry; isLast: boolean; onDelete: () => void; theme: any }> = ({ entry, isLast, onDelete, theme }) => {
  const config = ENTRY_TYPE_CONFIG[entry.type];
  const { formatDate: fmtDate, formatTime: fmtTime } = useSettings();
  const dateStr = fmtDate(entry.timestamp);
  const timeStr = fmtTime(entry.timestamp);

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
            <Text style={[styles.entryType, { color: config.color }]}>{config.label}</Text>
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
            {entry.watering.volumeMl && <DataItem label="Volume" value={`${entry.watering.volumeMl}ml`} theme={theme} />}
            {entry.watering.ph != null && <DataItem label="pH" value={`${entry.watering.ph}`} theme={theme} />}
            {entry.watering.method && <DataItem label="Método" value={entry.watering.method} theme={theme} />}
            {entry.watering.runoff && <DataItem label="Runoff" value="Sim" theme={theme} />}
          </View>
        )}

        {entry.type === 'nutrition' && entry.nutrition && (
          <View style={styles.entryData}>
            <DataItem label="Produto" value={entry.nutrition.product} theme={theme} />
            <DataItem label="Dose" value={`${entry.nutrition.doseMlPerL} ml/L`} theme={theme} />
            {entry.nutrition.ph != null && <DataItem label="pH" value={`${entry.nutrition.ph}`} theme={theme} />}
            {entry.nutrition.ec != null && <DataItem label="EC" value={`${entry.nutrition.ec}`} theme={theme} />}
            {entry.nutrition.type && <DataItem label="Tipo" value={entry.nutrition.type} theme={theme} />}
          </View>
        )}

        {entry.type === 'pruning' && entry.pruning && (
          <View style={styles.entryData}>
            <DataItem label="Método" value={entry.pruning.method} theme={theme} />
            {entry.pruning.details && <DataItem label="Detalhes" value={entry.pruning.details} theme={theme} />}
          </View>
        )}

        {entry.type === 'photo' && entry.mediaUri && (
          <Image source={{ uri: entry.mediaUri }} style={[styles.entryImage, { backgroundColor: theme.colors.elevation.level2 }]} />
        )}

        {entry.type === 'video' && entry.mediaUri && (
          <View style={[styles.entryVideoPlaceholder, { backgroundColor: theme.colors.inverseSurface }]}>
            <Text style={styles.entryVideoIcon}>🎬</Text>
            <Text style={[styles.entryVideoText, { color: theme.colors.inverseOnSurface }]}>Vídeo salvo</Text>
          </View>
        )}

        {entry.note && <Text style={[styles.entryNote, { color: theme.colors.onSurfaceVariant }]}>{entry.note}</Text>}

        <Text style={[styles.entryDate, { color: theme.colors.outline }]}>{dateStr}</Text>
      </View>
    </View>
  );
};

const DataItem = ({ label, value, theme }: { label: string; value: string; theme: any }) => (
  <View style={[styles.dataItem, { backgroundColor: theme.colors.elevation.level1 }]}>
    <Text style={[styles.dataLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    <Text style={[styles.dataValue, { color: theme.colors.onSurface }]}>{value}</Text>
  </View>
);

const InfoBlock = ({ label, value, theme }: { label: string; value: string; theme: any }) => (
  <View style={styles.infoBlock}>
    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{value}</Text>
    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loader: { marginVertical: 20 },

  header: { padding: 16, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strainName: { fontSize: 22, fontWeight: '800', flex: 1 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 18 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' },
  editStageBtn: { padding: 4, marginLeft: 4 },
  editStageBtnText: { fontSize: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  badgeStage: { borderWidth: 1 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  infoBlock: { width: '30%', alignItems: 'center', marginBottom: 8 },
  infoValue: { fontSize: 15, fontWeight: '700' },
  infoLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },

  notesCard: { padding: 16, marginTop: 1 },
  notesLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  notesText: { fontSize: 14, lineHeight: 20 },

  actionsSection: { padding: 16, marginTop: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    flex: 1, minWidth: 90, padding: 12, borderRadius: 10,
    borderWidth: 1, alignItems: 'center',
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '600' },

  timelineSection: { padding: 16 },
  emptyTimeline: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: '600' },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 4, maxWidth: 260 },

  entryWrapper: { flexDirection: 'row', marginBottom: 2 },
  timelineLine: { width: 28, alignItems: 'center', paddingTop: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineBar: { flex: 1, width: 2, marginTop: 2 },
  entryCard: {
    flex: 1, borderRadius: 10, padding: 12,
    marginLeft: 4, marginBottom: 10, borderWidth: 1,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entryHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  entryIcon: { fontSize: 16, marginRight: 6 },
  entryType: { fontSize: 13, fontWeight: '700' },
  entryHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryTime: { fontSize: 12 },
  entryDelBtn: { padding: 4 },
  entryDelText: { fontSize: 14, fontWeight: '700' },
  entryData: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  dataItem: { borderRadius: 6, padding: 6, paddingHorizontal: 10 },
  dataLabel: { fontSize: 10, fontWeight: '500' },
  dataValue: { fontSize: 13, fontWeight: '600' },
  entryImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  entryVideoPlaceholder: {
    width: '100%', height: 100, borderRadius: 8, marginBottom: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  entryVideoIcon: { fontSize: 32 },
  entryVideoText: { fontSize: 13, marginTop: 4 },
  entryNote: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  entryDate: { fontSize: 11, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 16 },
  modalStageItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderWidth: 1, borderColor: 'transparent' },
  modalStageIcon: { fontSize: 22, marginRight: 12 },
  modalStageLabel: { fontSize: 16, flex: 1 },
  modalStageCheck: { fontSize: 18, fontWeight: '700' },
});

export default PlantDetailScreen;
