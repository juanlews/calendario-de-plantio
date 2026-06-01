import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CannabisPlanting } from '../../types/planting';
import { daysRemaining, stageIcon, stageColor, stageLabel, plantDisplayName as plantDisplayNameDefault, toLocalIsoDate } from '../../utils/dateUtils';
import { getStrainInfo } from '../../data/strains';
import { usePlants } from '../../context/PlantContext';
import { useSettings } from '../../context/SettingsContext';
import { geneticsColor, styles } from './shared';

interface Props {
  item: CannabisPlanting;
  navigation: any;
  theme: any;
}

export const PlantCard: React.FC<Props> = ({ item, navigation, theme }) => {
  const { deletePlanting, updateStage } = usePlants();
  const { formatDate: fmtDate } = useSettings();
  const { t } = useTranslation();
  const plantDisplayName = (p: Parameters<typeof plantDisplayNameDefault>[0]) =>
    plantDisplayNameDefault(p, fmtDate);

  const info = getStrainInfo(item.strainName);
  const stage = item.currentStage;
  const isGrowing = !['secagem', 'cura'].includes(stage);
  const daysSinceSeed = daysRemaining(item.seedDate) * -1;
  const canAdvance = stage === 'vegetativo' || stage === 'floração';

  const handleDelete = () => {
    const displayName = plantDisplayName(item);
    Alert.alert(t('plantDetail.deleteTitle'), t('plantDetail.deleteMessage', { name: displayName }), [
      { text: t('plantDetail.deleteCancel'), style: 'cancel' },
      { text: t('plantDetail.deleteConfirm'), style: 'destructive', onPress: () => deletePlanting(item.id) },
    ]);
  };

  const handleAdvanceStage = () => {
    if (stage === 'vegetativo') {
      Alert.alert(t('plantDetail.change1212'), `${item.strainName}?`, [
        { text: t('plantDetail.deleteCancel'), style: 'cancel' },
        {
          text: t('plantDetail.change1212'),
          onPress: () => updateStage(item.id, toLocalIsoDate(new Date())),
        },
      ]);
    } else if (stage === 'floração') {
      Alert.alert(t('plantDetail.harvestNow'), `${item.strainName}?`, [
        { text: t('plantDetail.deleteCancel'), style: 'cancel' },
        {
          text: t('plantDetail.harvestNow'),
          onPress: () => updateStage(item.id, undefined, toLocalIsoDate(new Date())),
        },
      ]);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
        !isGrowing && styles.cardMuted,
      ]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('PlantDetail', { plantingId: item.id })}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeBadge, { backgroundColor: geneticsColor(item.genetics) }]}>
            <Text style={styles.typeText}>{item.genetics.toUpperCase().slice(0, 3)}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: item.floweringType === 'autoflower' ? '#E65100' : '#455A64' }]}>
            <Text style={styles.typeText}>{item.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{plantDisplayName(item)}</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.delBtn}>
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
          <Text style={[styles.qty, { color: theme.colors.onSurfaceVariant }]}>{item.quantity} plantas</Text>
        )}
      </View>

      {/* Info grid */}
      <View style={[styles.infoGrid, { borderColor: theme.colors.outlineVariant }]}>
        <InfoBlock label={t('plantDetail.daysSinceSeed')} value={`${Math.max(0, daysSinceSeed)}d`} theme={theme} />
        <InfoBlock label={t('plantDetail.daysFlowering')} value={item.floweringDays > 0 ? `${item.floweringDays}d` : (item.floweringType === 'autoflower' ? '~25d' : '—')} theme={theme} />
        <InfoBlock label={t('addPlanting.thc')} value={info ? `${info.thcMin}-${info.thcMax}%` : '—'} theme={theme} />
        <InfoBlock label={t('addPlanting.yield')} value={info?.yield ?? '—'} theme={theme} />
      </View>

      {/* Dates */}
      <View style={styles.datesRow}>
        <View style={styles.dateCol}>
          <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>🌱 {t('stages.seedling')}</Text>
          <Text style={[styles.dateValue, { color: theme.colors.onSurface }]}>{fmtDate(item.seedDate)}</Text>
        </View>
        {item.floweringDate && (
          <View style={styles.dateCol}>
            <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>🌺 {t('stages.flowering')}</Text>
            <Text style={[styles.dateValue, { color: theme.colors.onSurface }]}>{fmtDate(item.floweringDate)}</Text>
          </View>
        )}
        {item.harvestDate && (
          <View style={styles.dateCol}>
            <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>✂️ {t('calendar.harvest')}</Text>
            <Text style={[styles.dateValue, { color: theme.colors.onSurface }]}>{fmtDate(item.harvestDate)}</Text>
          </View>
        )}
      </View>

      {/* Advance stage button */}
      {canAdvance && (
        <TouchableOpacity
          style={[styles.advanceBtn, stage === 'vegetativo' ? styles.advanceFlower : styles.advanceHarvest]}
          onPress={handleAdvanceStage}
        >
          <Text style={styles.advanceText}>
            {stage === 'vegetativo' ? t('plantDetail.change1212') : t('plantDetail.harvestNow')}
          </Text>
        </TouchableOpacity>
      )}

      {item.notes && <Text style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>📝 {item.notes}</Text>}
    </TouchableOpacity>
  );
};

const InfoBlock: React.FC<{ label: string; value: string; theme: any }> = ({ label, value, theme }) => (
  <View style={styles.infoBlock}>
    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{value}</Text>
  </View>
);
