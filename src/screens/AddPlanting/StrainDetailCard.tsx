import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { StrainInfo, CannabisGenetics, FloweringType } from '../../data/strains';
import { DetailItem, styles } from './shared';

const geneticsColor = (g: CannabisGenetics) => {
  switch (g) {
    case 'indica': return '#7B1FA2';
    case 'sativa': return '#1565C0';
    case 'hybrid': return '#2E7D32';
  }
};

const floweringTypeColor = (ft: FloweringType) => {
  return ft === 'autoflower' ? '#E65100' : '#455A64';
};

interface Props {
  strain: StrainInfo;
  theme: any;
}

export const StrainDetailCard: React.FC<Props> = ({ strain, theme }) => (
  <View style={[styles.detailCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
    <View style={styles.detailHeader}>
      <View style={styles.detailBadges}>
        <View style={[styles.detailTypeBadge, { backgroundColor: geneticsColor(strain.genetics) }]}>
          <Text style={styles.detailTypeText}>{strain.genetics.toUpperCase()}</Text>
        </View>
        <View style={[styles.detailTypeBadge, { backgroundColor: floweringTypeColor(strain.floweringType) }]}>
          <Text style={styles.detailTypeText}>
            {strain.floweringType === 'autoflower' ? 'AUTOFLORENTE' : 'FOTOPERIÓDICA'}
          </Text>
        </View>
      </View>
      <View style={styles.detailInfo}>
        <Text style={[styles.detailName, { color: theme.colors.onSurface }]}>{strain.name}</Text>
        <Text style={[styles.detailBreeder, { color: theme.colors.onSurfaceVariant }]}>{strain.breeder}</Text>
      </View>
    </View>

    <View style={styles.detailGrid}>
      <DetailItem label="THC" value={`${strain.thcMin}-${strain.thcMax}%`} theme={theme} />
      <DetailItem label="Floração" value={`${strain.floweringDays}d`} theme={theme} />
      {strain.floweringType === 'autoflower' && strain.autoflowerDays && (
        <DetailItem label="Semente→Colheita" value={`${strain.autoflowerDays}d`} theme={theme} />
      )}
      <DetailItem label="Altura" value={strain.height} theme={theme} />
      <DetailItem label="Yield" value={strain.yield} theme={theme} />
      <DetailItem label="Dificuldade" value={strain.difficulty} theme={theme} />
    </View>

    {strain.effects.length > 0 && (
      <View style={styles.tagsRow}>
        <Text style={[styles.tagsLabel, { color: theme.colors.onSurfaceVariant }]}>Efeitos:</Text>
        {strain.effects.map((e) => (
          <View key={e} style={[styles.effectTag, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.effectText, { color: theme.colors.onPrimaryContainer }]}>{e}</Text>
          </View>
        ))}
      </View>
    )}

    {strain.flavors.length > 0 && (
      <View style={styles.tagsRow}>
        <Text style={[styles.tagsLabel, { color: theme.colors.onSurfaceVariant }]}>Sabores:</Text>
        {strain.flavors.map((f) => (
          <View key={f} style={[styles.flavorTag, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text style={[styles.flavorText, { color: theme.colors.onSecondaryContainer }]}>{f}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);
