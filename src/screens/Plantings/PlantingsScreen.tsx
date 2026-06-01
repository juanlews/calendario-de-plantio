import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { usePlants } from '../../context/PlantContext';
import { plantDisplayName as plantDisplayNameDefault } from '../../utils/dateUtils';
import { useSettings } from '../../context/SettingsContext';
import TopHeader from '../../components/TopHeader';
import type { PlantDetailParamList } from '../PlantDetail';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PlantCard } from './PlantCard';
import { styles } from './shared';

type PlantingsNavProp = NativeStackNavigationProp<PlantDetailParamList, 'PlantDetail'>;

const PlantingsScreen: React.FC<{ navigation: PlantingsNavProp }> = ({ navigation }) => {
  const { plantings, loading } = usePlants();
  const { formatDate: fmtDate } = useSettings();
  const theme = useTheme();
  const { t } = useTranslation();

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

  const renderPlanting = ({ item }: { item: typeof plantings[0] }) => (
    <PlantCard item={item} navigation={navigation} theme={theme} />
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (plantings.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.emptyIcon}>🌱</Text>
        <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>{t('plantings.emptyTitle')}</Text>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>{t('plantings.emptyText')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopHeader title={t('nav.plantings')} />
      <FlatList
        data={sortedPlantings}
        renderItem={renderPlanting}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default PlantingsScreen;
