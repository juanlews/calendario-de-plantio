import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Alert,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePlants } from '../../context/PlantContext';
import type { CannabisPlanting, PlantJournalEntry, JournalEntryType, GrowthStage } from '../../types/planting';
import { daysRemaining, stageIcon, stageColor, stageLabel, daysInStage, plantDisplayName as plantDisplayNameDefault } from '../../utils/dateUtils';
import { useSettings } from '../../context/SettingsContext';
import { getStrainInfo } from '../../data/strains';
import { loadJournalEntries, deleteJournalEntry } from '../../data/journalStorage';
import TopHeader from '../../components/TopHeader';
import { PlantHeader } from './PlantHeader';
import { InfoGrid } from './InfoGrid';
import { QuickActions } from './QuickActions';
import { JournalTimeline } from './JournalTimeline';
import { StageEditModal } from './StageEditModal';
import { geneticsColor, styles } from './shared';

export type PlantDetailParamList = {
  PlantingsList: undefined;
  PlantDetail: { plantingId: string };
  AddJournalEntry: { plantingId: string; entryType?: JournalEntryType };
};

type Props = NativeStackScreenProps<PlantDetailParamList, 'PlantDetail'>;

const PlantDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { plantings, updateCurrentStage } = usePlants();
  const theme = useTheme();
  const { t } = useTranslation();
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
        <Text style={{ color: theme.colors.onSurface }}>{t('plantings.emptyTitle')}</Text>
      </View>
    );
  }

  const stage = planting.currentStage;
  const daysSinceSeed = daysRemaining(planting.seedDate) * -1;

  const handleDeleteEntry = (entry: PlantJournalEntry) => {
    Alert.alert(t('journal.deleteEntryTitle'), t('journal.deleteEntryMsg'), [
      { text: t('journal.cancelBtn'), style: 'cancel' },
      {
        text: t('journal.deleteBtn'),
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
      t('plantDetail.deleteTitle'),
      t('plantDetail.deleteMessage', { name: displayName }),
      [
        { text: t('plantDetail.deleteCancel'), style: 'cancel' },
        {
          text: t('plantDetail.deleteConfirm'),
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

  return (
    <View style={{ flex: 1 }}>
      <TopHeader
        title={displayName}
        subtitle={`${stageIcon(stage)} ${stageLabel(stage)}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'trash-outline', onPress: handleDeletePlant }}
      />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Plant Header */}
        <PlantHeader
          planting={planting}
          displayName={displayName}
          daysSinceSeed={daysSinceSeed}
          strainThc={info ? `${info.thcMin}–${info.thcMax}%` : '—'}
          onEditStage={() => setShowStageModal(true)}
          onDelete={handleDeletePlant}
          theme={theme}
        />

        {/* Info Grid */}
        <InfoGrid
          planting={planting}
          daysSinceSeed={daysSinceSeed}
          strainThc={info ? `${info.thcMin}–${info.thcMax}%` : '—'}
          formatDate={fmtDate}
          theme={theme}
        />

        {/* Notes */}
        {planting.notes && (
          <View style={[styles.notesCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.notesLabel, { color: theme.colors.onSurfaceVariant }]}>📝 {t('plantDetail.notes')}</Text>
            <Text style={[styles.notesText, { color: theme.colors.onSurface }]}>{planting.notes}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <QuickActions
          plantingId={plantingId}
          onNavigate={(type) =>
            navigation.navigate('AddJournalEntry', { plantingId, entryType: type })
          }
          theme={theme}
        />

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📋 {t('journal.addEntryTitle')} ({entries.length})
          </Text>
          <JournalTimeline
            entries={entries}
            loading={loading}
            onDeleteEntry={handleDeleteEntry}
            theme={theme}
          />
        </View>
      </ScrollView>

      {/* Stage Edit Modal */}
      <StageEditModal
        visible={showStageModal}
        plantingId={plantingId}
        seedDate={planting.seedDate}
        currentStage={stage}
        onClose={() => setShowStageModal(false)}
        theme={theme}
      />
    </View>
  );
};

export default PlantDetailScreen;
