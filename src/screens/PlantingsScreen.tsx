import React, { useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { usePlants } from '../context/PlantContext';
import { formatDate, daysRemaining, stageIcon, stageColor, stageLabel, daysInStage, plantDisplayName as plantDisplayNameDefault, toLocalIsoDate } from '../utils/dateUtils';
import { useSettings } from '../context/SettingsContext';
import { getStrainInfo } from '../data/strains';
import type { PlantDetailParamList } from './PlantDetailScreen';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type PlantingsNavProp = NativeStackNavigationProp<PlantDetailParamList, 'PlantDetail'>;

const PlantingsScreen = ({ navigation }: { navigation: PlantingsNavProp }) => {
  const { plantings, loading, deletePlanting, updateStage } = usePlants();
  const { formatDate: fmtDate, formatTime: fmtTime, settings } = useSettings();

  // Helper wrappers so useMemo/useCallback deps are stable
  const plantDisplayName = (p: Parameters<typeof plantDisplayNameDefault>[0]) =>
    plantDisplayNameDefault(p, fmtDate);

  const sortedPlantings = useMemo(() => {
    return [...plantings].sort((a, b) => {
      // Active first, then by stage order, then by seed date
      const stageOrder: Record<string, number> = {
        'germinação': 0, 'muda': 1, 'vegetativo': 2,
        'floração': 3, 'secagem': 4, 'cura': 5,
      };
      const diff = (stageOrder[a.currentStage] ?? 99) - (stageOrder[b.currentStage] ?? 99);
      if (diff !== 0) return diff;
      return new Date(b.seedDate).getTime() - new Date(a.seedDate).getTime();
    });
  }, [plantings]);

  const handleDelete = useCallback(
    (id: string, plant: typeof plantings[0]) => {
      const displayName = plantDisplayName(plant);
      Alert.alert('Excluir planta', `Remover "${displayName}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deletePlanting(id) },
      ]);
    },
    [deletePlanting, fmtDate],
  );

  const handleAdvanceStage = useCallback(
    (id: string, currentStage: string, strainName: string) => {
      if (currentStage === 'vegetativo') {
        Alert.alert('Iniciar Floração', `Mudar ${strainName} para 12/12 agora?`, [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Iniciar',
            onPress: () => updateStage(id, toLocalIsoDate(new Date())),
          },
        ]);
      } else if (currentStage === 'floração') {
        Alert.alert('Colher!', `Colher ${strainName} agora?`, [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Colher',
            onPress: () => updateStage(id, undefined, toLocalIsoDate(new Date())),
          },
        ]);
      }
    },
    [updateStage],
  );

  const geneticsColor = (g: string) => {
    switch (g) {
      case 'indica': return '#7B1FA2';
      case 'sativa': return '#1565C0';
      case 'hybrid': return '#2E7D32';
      default: return '#2E7D32';
    }
  };

  const renderPlanting = ({ item }: { item: typeof plantings[0] }) => {
    const info = getStrainInfo(item.strainName);
    const stage = item.currentStage;
    const isGrowing = !['secagem', 'cura'].includes(stage);
    const daysSinceSeed = daysRemaining(item.seedDate) * -1;
    const canAdvance = stage === 'vegetativo' || stage === 'floração';

    return (
      <TouchableOpacity
        style={[styles.card, !isGrowing && styles.cardMuted]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PlantDetail', { plantingId: item.id })}>
        {/* Inner content wrapped in Touchable */}
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.typeBadge, { backgroundColor: geneticsColor(item.genetics) }]}>
              <Text style={styles.typeText}>{item.genetics.toUpperCase().slice(0, 3)}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: item.floweringType === 'autoflower' ? '#E65100' : '#455A64' }]}>
              <Text style={styles.typeText}>{item.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}</Text>
            </View>
            <Text style={styles.name}>{plantDisplayName(item)}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id, item)} style={styles.delBtn}>
            <Text style={styles.delBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Stage */}
        <View style={styles.stageRow}>
          <View style={[styles.stageBadge, { backgroundColor: stageColor(stage) + '22', borderColor: stageColor(stage) }]}>
            <Text style={styles.stageIcon}>{stageIcon(stage)}</Text>
            <Text style={[styles.stageText, { color: stageColor(stage) }]}>{stageLabel(stage)}</Text>
          </View>
          {item.quantity > 1 && (
            <Text style={styles.qty}>{item.quantity} plantas</Text>
          )}
        </View>

        {/* Info grid */}
        <View style={styles.infoGrid}>
          <InfoBlock label="Desde semente" value={`${Math.max(0, daysSinceSeed)}d`} />
          <InfoBlock label="Flora" value={item.floweringDays > 0 ? `${item.floweringDays}d` : (item.floweringType === 'autoflower' ? '~25d' : '—')} />
          <InfoBlock label="THC" value={info ? `${info.thcMin}-${info.thcMax}%` : '—'} />
          <InfoBlock label="Yield" value={info?.yield ?? '—'} />
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>🌱 Semente</Text>
            <Text style={styles.dateValue}>{fmtDate(item.seedDate)}</Text>
          </View>
          {item.floweringDate && (
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>🌺 Floração</Text>
              <Text style={styles.dateValue}>{fmtDate(item.floweringDate)}</Text>
            </View>
          )}
          {item.harvestDate && (
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>✂️ Colheita</Text>
              <Text style={styles.dateValue}>{fmtDate(item.harvestDate)}</Text>
            </View>
          )}
          {!item.floweringDate && item.expectedHarvestDate && (
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>📅 Est. colheita</Text>
              <Text style={styles.dateValue}>{fmtDate(item.expectedHarvestDate)}</Text>
            </View>
          )}
        </View>

        {/* Advance stage button */}
        {canAdvance && (
          <TouchableOpacity
            style={[styles.advanceBtn, stage === 'vegetativo' ? styles.advanceFlower : styles.advanceHarvest]}
            onPress={() => handleAdvanceStage(item.id, stage, item.strainName)}
          >
            <Text style={styles.advanceText}>
              {stage === 'vegetativo' ? '🌺 Mudar para 12/12' : '✂️ Colher agora'}
            </Text>
          </TouchableOpacity>
        )}

        {item.notes && <Text style={styles.notes}>📝 {item.notes}</Text>}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#2e7d32" /></View>;
  }

  if (plantings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🌱</Text>
        <Text style={styles.emptyTitle}>Nenhuma planta cadastrada</Text>
        <Text style={styles.emptyText}>
          Vá para a aba "Adicionar" para começar seu grow!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sortedPlantings}
      renderItem={renderPlanting}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
    />
  );
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  list: { padding: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#999', textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardMuted: { opacity: 0.7 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  typeBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6,
  },
  typeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  name: { fontSize: 18, fontWeight: '700', color: '#333' },
  delBtn: { padding: 4 },
  delBtnText: { fontSize: 20 },
  stageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  stageBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  stageIcon: { fontSize: 14, marginRight: 4 },
  stageText: { fontSize: 13, fontWeight: '700' },
  qty: { marginLeft: 'auto', fontSize: 12, color: '#999' },
  infoGrid: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0', marginBottom: 10,
  },
  infoBlock: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 10, color: '#999', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 2 },
  datesRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dateCol: { flex: 1 },
  dateLabel: { fontSize: 11, color: '#999' },
  dateValue: { fontSize: 13, color: '#333', fontWeight: '500' },
  advanceBtn: { padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  advanceFlower: { backgroundColor: '#E91E63' },
  advanceHarvest: { backgroundColor: '#FF9800' },
  advanceText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  notes: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 6 },
});

export default PlantingsScreen;
