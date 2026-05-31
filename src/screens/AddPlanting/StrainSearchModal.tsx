import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Modal,
  FlatList, ActivityIndicator,
} from 'react-native';
import { searchStrains } from '../../data/strains';
import type { StrainInfo, CannabisGenetics, FloweringType } from '../../data/strains';
import { styles } from './shared';

const PAGE_SIZE = 30;

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
  visible: boolean;
  selectedStrain: StrainInfo | undefined;
  onClose: () => void;
  onSelect: (strain: StrainInfo) => void;
  theme: any;
}

export const StrainSearchModal: React.FC<Props> = ({ visible, selectedStrain, onClose, onSelect, theme }) => {
  const [searchText, setSearchText] = useState('');
  const [allResults, setAllResults] = useState<StrainInfo[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const visibleResults = allResults.slice(0, visibleCount);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchText(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.trim().length < 2) {
        setAllResults([]);
        setVisibleCount(0);
        setTotalResults(0);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      setVisibleCount(0);
      setTimeout(() => {
        const { results, total } = searchStrains(query);
        setAllResults(results);
        setVisibleCount(PAGE_SIZE);
        setTotalResults(total);
        setIsSearching(false);
      }, 0);
    }, 200);
  }, []);

  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setAllResults([]);
      setVisibleCount(0);
      setTotalResults(0);
      setIsSearching(false);
    }
  }, [visible]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSelectStrain = useCallback((strain: StrainInfo) => {
    onSelect(strain);
  }, [onSelect]);

  const renderStrainItem = useCallback(({ item }: { item: StrainInfo }) => (
    <TouchableOpacity
      style={[
        styles.strainItem,
        { borderBottomColor: theme.colors.outlineVariant },
        selectedStrain?.name === item.name && { backgroundColor: theme.colors.primaryContainer },
      ]}
      onPress={() => handleSelectStrain(item)}
      activeOpacity={0.6}
    >
      <View style={[styles.typeDot, { backgroundColor: geneticsColor(item.genetics) }]} />
      <View style={styles.strainInfo}>
        <Text style={[styles.strainName, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.strainMeta, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.breeder} · THC {item.thcMin}-{item.thcMax}% · Flora {item.floweringDays}d
        </Text>
      </View>
      <View style={styles.badgeRow}>
        <Text style={[
          styles.typeBadge,
          { backgroundColor: geneticsColor(item.genetics) + '22', color: geneticsColor(item.genetics) },
        ]}>
          {item.genetics.toUpperCase().slice(0, 3)}
        </Text>
        <Text style={[
          styles.typeBadge,
          { backgroundColor: floweringTypeColor(item.floweringType) + '22', color: floweringTypeColor(item.floweringType) },
        ]}>
          {item.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}
        </Text>
        <Text style={styles.difficultyBadge}>
          {item.difficulty === 'fácil' ? '🟢' : item.difficulty === 'média' ? '🟡' : '🔴'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [selectedStrain, handleSelectStrain, theme]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Selecionar Strain</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.colors.elevation.level2 }]}
            >
              <Text style={[styles.closeBtnText, { color: theme.colors.onSurfaceVariant }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBarWrapper}>
            <TextInput
              style={[
                styles.searchBar,
                { backgroundColor: theme.colors.elevation.level1, color: theme.colors.onSurface },
              ]}
              placeholder="Digite para buscar (nome, breeder, efeito, sabor)..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchText}
              onChangeText={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {isSearching && (
              <ActivityIndicator style={styles.searchSpinner} size="small" color={theme.colors.primary} />
            )}
          </View>

          {visibleResults.length > 0 && (
            <Text style={[styles.resultsCount, { color: theme.colors.onSurfaceVariant }]}>
              {totalResults} strains encontradas
              {visibleResults.length < totalResults ? `, mostrando ${visibleResults.length}` : ''}
            </Text>
          )}

          <View style={styles.legend}>
            <Text style={[styles.legendSectionTitle, { color: theme.colors.onSurfaceVariant }]}>Genética:</Text>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1565C0' }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Sativa</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#7B1FA2' }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Indica</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Hybrid</Text>
            </View>
            <Text style={[styles.legendSectionTitle, { color: theme.colors.onSurfaceVariant, marginLeft: 8 }]}>
              Floração:
            </Text>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Auto</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#455A64' }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Foto</Text>
            </View>
          </View>

          <FlatList
            data={visibleResults}
            renderItem={renderStrainItem}
            keyExtractor={(item) => `${item.name}|${item.breeder}`}
            style={styles.modalList}
            windowSize={5}
            removeClippedSubviews
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            ListEmptyComponent={
              searchText.trim().length >= 2 ? (
                <View style={styles.emptyResults}>
                  <Text style={[styles.emptyResultsText, { color: theme.colors.onSurfaceVariant }]}>
                    {isSearching ? 'Buscando...' : 'Nenhuma strain encontrada'}
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              visibleCount < totalResults ? (
                <TouchableOpacity
                  style={[styles.loadMoreBtn, { borderTopColor: theme.colors.outlineVariant }]}
                  onPress={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, totalResults))}
                >
                  <Text style={[styles.loadMoreText, { color: theme.colors.primary }]}>
                    Carregar mais ({totalResults - visibleCount} restantes)
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );
};
