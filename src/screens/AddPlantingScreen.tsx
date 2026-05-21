import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Modal,
  ActivityIndicator, FlatList,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePlants } from '../context/PlantContext';
import { searchStrains, getStrainInfo } from '../data/strains';
import type { StrainInfo, CannabisGenetics, FloweringType } from '../data/strains';
import type { GrowthStage } from '../types/planting';
import { addDaysToDate, toLocalIsoDate, stageIcon, stageColor, stageLabel } from '../utils/dateUtils';

// Helper: format Date -> YYYY-MM-DD for HTML date input
const toIsoDateString = (d: Date) => d.toISOString().slice(0, 10);
const fromIsoDateString = (s: string) => new Date(s + 'T00:00:00');
import { useSettings } from '../context/SettingsContext';
import { createCannabisPlanting } from '../data/storage';
import TopHeader from '../components/TopHeader';

const GROWTH_STAGES: GrowthStage[] = ['germinação', 'muda', 'vegetativo', 'floração', 'secagem', 'cura'];

const AddPlantingScreen = () => {
  const { addPlanting } = usePlants();
  const { formatDate } = useSettings();
  const theme = useTheme();

  // Strain selection
  const PAGE_SIZE = 30;
  const [searchText, setSearchText] = useState('');
  const [selectedStrain, setSelectedStrain] = useState<StrainInfo | undefined>(undefined);
  const [allResults, setAllResults] = useState<StrainInfo[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const visibleResults = allResults.slice(0, visibleCount);

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchText(query);
    setSelectedStrain(undefined);

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
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelectStrain = useCallback((strain: StrainInfo) => {
    setSelectedStrain(strain);
    setSearchText(strain.name);
    setShowModal(false);
    setAllResults([]);
    setVisibleCount(0);
  }, []);

  // Form fields
  const [seedDate, setSeedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nickname, setNickname] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [selectedStage, setSelectedStage] = useState<GrowthStage>('germinação');

  const harvestDatePreview = useMemo(() => {
    if (!selectedStrain) return null;
    const seedDateStr = toLocalIsoDate(seedDate);
    if (selectedStrain.floweringType === 'autoflower' && selectedStrain.autoflowerDays) {
      return addDaysToDate(seedDateStr, selectedStrain.autoflowerDays);
    }
    return addDaysToDate(seedDateStr, 30 + selectedStrain.floweringDays);
  }, [selectedStrain, seedDate]);

  const handleAdd = () => {
    if (!selectedStrain) {
      Alert.alert('Atenção', 'Selecione uma strain na lista.');
      return;
    }
    const seedDateStr = toLocalIsoDate(seedDate);
    const qty = parseInt(quantity) || 1;

    const newPlanting = createCannabisPlanting(
      selectedStrain.name,
      selectedStrain.genetics,
      selectedStrain.floweringType,
      seedDateStr,
      selectedStrain.floweringDays,
      selectedStrain.autoflowerDays,
      qty,
      notes.trim(),
      nickname.trim(),
      selectedStage,
    );

    addPlanting(newPlanting);

    setSelectedStrain(undefined);
    setSearchText('');
    setAllResults([]);
    setVisibleCount(0);
    setSeedDate(new Date());
    setNickname('');
    setQuantity('1');
    setNotes('');
    setSelectedStage('germinação');
    setShowModal(false);

    Alert.alert('Sucesso!', `${selectedStrain.name} adicionada ao grow 🌱`);
  };

  // Colors - negócio, não tema
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

  const renderStrainItem = useCallback(({ item }: { item: StrainInfo }) => (
    <TouchableOpacity
      style={[styles.strainItem, { borderBottomColor: theme.colors.outlineVariant }, selectedStrain?.name === item.name && { backgroundColor: theme.colors.primaryContainer }]}
      onPress={() => handleSelectStrain(item)}
      activeOpacity={0.6}
    >
      <View style={[styles.typeDot, { backgroundColor: geneticsColor(item.genetics) }]} />
      <View style={styles.strainInfo}>
        <Text style={[styles.strainName, { color: theme.colors.onSurface }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.strainMeta, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.breeder} · THC {item.thcMin}-{item.thcMax}% · Flora {item.floweringDays}d
        </Text>
      </View>
      <View style={styles.badgeRow}>
        <Text style={[styles.typeBadge, { backgroundColor: geneticsColor(item.genetics) + '22', color: geneticsColor(item.genetics) }]}>
          {item.genetics.toUpperCase().slice(0, 3)}
        </Text>
        <Text style={[styles.typeBadge, { backgroundColor: floweringTypeColor(item.floweringType) + '22', color: floweringTypeColor(item.floweringType) }]}>
          {item.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}
        </Text>
        <Text style={styles.difficultyBadge}>
          {item.difficulty === 'fácil' ? '🟢' : item.difficulty === 'média' ? '🟡' : '🔴'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [selectedStrain, handleSelectStrain, theme]);

  // Web input style
  const webInputStyle: React.CSSProperties = {
    width: '100%', padding: '14px', fontSize: 16, borderRadius: 10,
    border: `1px solid ${theme.colors.outlineVariant}`,
    backgroundColor: theme.colors.elevation.level1,
    color: theme.colors.onSurface, boxSizing: 'border-box' as const, fontFamily: 'inherit',
  };

  const webSelectStyle: React.CSSProperties = {
    width: '100%', padding: '14px', fontSize: 16, borderRadius: 10,
    border: `1px solid ${theme.colors.outlineVariant}`,
    backgroundColor: theme.colors.elevation.level1,
    color: theme.colors.onSurface, fontFamily: 'inherit', appearance: 'auto',
  };

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title="Adicionar Planta" />
      <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Strain search */}
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>🌿 Buscar strain</Text>
        <TouchableOpacity
          style={[styles.searchInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
        >
          {selectedStrain ? (
            <View style={styles.selectedRow}>
              <View style={[styles.typeDot, { backgroundColor: geneticsColor(selectedStrain.genetics) }]} />
              <View style={styles.selectedInfo}>
                <Text style={[styles.selectedName, { color: theme.colors.onSurface }]}>{selectedStrain.name}</Text>
                <Text style={[styles.selectedMeta, { color: theme.colors.onSurfaceVariant }]}>
                  {selectedStrain.breeder} · THC {selectedStrain.thcMin}-{selectedStrain.thcMax}%
                </Text>
              </View>
              <View style={styles.selectedBadges}>
                <Text style={[styles.miniBadge, { backgroundColor: geneticsColor(selectedStrain.genetics), color: '#fff' }]}>
                  {selectedStrain.genetics.toUpperCase().slice(0, 3)}
                </Text>
                <Text style={[styles.miniBadge, { backgroundColor: floweringTypeColor(selectedStrain.floweringType), color: '#fff' }]}>
                  {selectedStrain.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.placeholder, { color: theme.colors.onSurfaceVariant }]}>Toque para buscar 8000+ strains...</Text>
          )}
        </TouchableOpacity>

        {/* Search Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Selecionar Strain</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} style={[styles.closeBtn, { backgroundColor: theme.colors.elevation.level2 }]}>
                  <Text style={[styles.closeBtnText, { color: theme.colors.onSurfaceVariant }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search bar */}
              <View style={styles.searchBarWrapper}>
                <TextInput
                  style={[styles.searchBar, { backgroundColor: theme.colors.elevation.level1, color: theme.colors.onSurface }]}
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

              {/* Results count */}
              {visibleResults.length > 0 && (
                <Text style={[styles.resultsCount, { color: theme.colors.onSurfaceVariant }]}>
                  {totalResults} strains encontradas{visibleResults.length < totalResults ? `, mostrando ${visibleResults.length}` : ''}
                </Text>
              )}

              {/* Legend */}
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
                <Text style={[styles.legendSectionTitle, { color: theme.colors.onSurfaceVariant, marginLeft: 8 }]}>Floração:</Text>
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

        {/* Strain details */}
        {selectedStrain && (
          <View style={[styles.detailCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.detailHeader}>
              <View style={styles.detailBadges}>
                <View style={[styles.detailTypeBadge, { backgroundColor: geneticsColor(selectedStrain.genetics) }]}>
                  <Text style={styles.detailTypeText}>
                    {selectedStrain.genetics.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.detailTypeBadge, { backgroundColor: floweringTypeColor(selectedStrain.floweringType) }]}>
                  <Text style={styles.detailTypeText}>
                    {selectedStrain.floweringType === 'autoflower' ? 'AUTOFLORENTE' : 'FOTOPERIÓDICA'}
                  </Text>
                </View>
              </View>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailName, { color: theme.colors.onSurface }]}>{selectedStrain.name}</Text>
                <Text style={[styles.detailBreeder, { color: theme.colors.onSurfaceVariant }]}>{selectedStrain.breeder}</Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <DetailItem label="THC" value={`${selectedStrain.thcMin}-${selectedStrain.thcMax}%`} theme={theme} />
              <DetailItem label="Floração" value={`${selectedStrain.floweringDays}d`} theme={theme} />
              {selectedStrain.floweringType === 'autoflower' && selectedStrain.autoflowerDays && (
                <DetailItem label="Semente→Colheita" value={`${selectedStrain.autoflowerDays}d`} theme={theme} />
              )}
              <DetailItem label="Altura" value={selectedStrain.height} theme={theme} />
              <DetailItem label="Yield" value={selectedStrain.yield} theme={theme} />
              <DetailItem label="Dificuldade" value={selectedStrain.difficulty} theme={theme} />
            </View>

            {selectedStrain.effects.length > 0 && (
              <View style={styles.tagsRow}>
                <Text style={[styles.tagsLabel, { color: theme.colors.onSurfaceVariant }]}>Efeitos:</Text>
                {selectedStrain.effects.map((e) => (
                  <View key={e} style={[styles.effectTag, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text style={[styles.effectText, { color: theme.colors.onPrimaryContainer }]}>{e}</Text>
                  </View>
                ))}
              </View>
            )}

            {selectedStrain.flavors.length > 0 && (
              <View style={styles.tagsRow}>
                <Text style={[styles.tagsLabel, { color: theme.colors.onSurfaceVariant }]}>Sabores:</Text>
                {selectedStrain.flavors.map((f) => (
                  <View key={f} style={[styles.flavorTag, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Text style={[styles.flavorText, { color: theme.colors.onSecondaryContainer }]}>{f}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Nickname */}
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>🏷️ Apelido da planta (opcional)</Text>
        <TextInput
          style={[styles.nicknameInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface }]}
          placeholder="Ex: Planta da janela, Armário 1, Mãe #3..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={nickname}
          onChangeText={setNickname}
          maxLength={40}
        />

        {/* Quantity */}
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>🌱 Quantidade de plantas</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: theme.colors.primaryContainer }]} onPress={() => setQuantity(String(Math.max(1, (parseInt(quantity) || 1) - 1)))}>
            <Text style={[styles.qtyBtnText, { color: theme.colors.onPrimaryContainer }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.qtyValue, { color: theme.colors.onSurface }]}>{quantity}</Text>
          <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: theme.colors.primaryContainer }]} onPress={() => setQuantity(String(Math.min(50, (parseInt(quantity) || 1) + 1)))}>
            <Text style={[styles.qtyBtnText, { color: theme.colors.onPrimaryContainer }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Seed date */}
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>🗓️ Data da semente/germinação</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={toIsoDateString(seedDate)}
            max={toIsoDateString(new Date())}
            onChange={(e) => { if (e.target.value) setSeedDate(fromIsoDateString(e.target.value)); }}
            style={webInputStyle}
          />
        ) : (
          <>
            <TouchableOpacity style={[styles.dateBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.dateBtnText, { color: theme.colors.onSurface }]}>{formatDate(toLocalIsoDate(seedDate))}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={seedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, d) => { setShowDatePicker(false); if (d) setSeedDate(d); }}
                maximumDate={new Date()}
              />
            )}
          </>
        )}

        {/* Harvest preview */}
        {selectedStrain && harvestDatePreview && (
          <View style={[styles.previewCard, { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.secondary }]}>
            <Text style={[styles.previewTitle, { color: theme.colors.onSecondaryContainer }]}>📋 Previsão</Text>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: theme.colors.onSecondaryContainer }]}>{formatDate(toLocalIsoDate(seedDate))}</Text>
              <Text style={[styles.previewValue, { color: theme.colors.onSecondaryContainer }]}>{formatDate(harvestDatePreview)}</Text>
            </View>
          </View>
        )}

        {/* Growth stage */}
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>🌱 Estágio atual</Text>
        {Platform.OS === 'web' ? (
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as GrowthStage)}
            style={webSelectStyle}
          >
            {GROWTH_STAGES.map((s) => (
              <option key={s} value={s}>
                {stageIcon(s)} {stageLabel(s)}
              </option>
            ))}
          </select>
        ) : (
          <View style={styles.stageRow}>
            {GROWTH_STAGES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.stageBtn,
                  { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant },
                  selectedStage === s && { backgroundColor: stageColor(s) + '22', borderColor: stageColor(s) },
                ]}
                onPress={() => setSelectedStage(s)}
              >
                <Text style={styles.stageIcon}>{stageIcon(s)}</Text>
                <Text style={[styles.stageBtnText, { color: theme.colors.onSurfaceVariant }, selectedStage === s && { color: stageColor(s), fontWeight: '700' }]}>
                  {stageLabel(s)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Notes */}
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>📝 Observações (opcional)</Text>
        <TextInput
          style={[styles.notesInput, styles.textArea, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface }]}
          placeholder="Ex: Indoor, LED 300W, vaso 11L..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }, !selectedStrain && { backgroundColor: theme.colors.outline }]}
          disabled={!selectedStrain}
          onPress={handleAdd}
        >
          <Text style={[styles.submitText, { color: theme.colors.onPrimary }]}>🌱 Adicionar ao grow</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const DetailItem = ({ label, value, theme }: { label: string; value: string; theme: any }) => (
  <View style={[styles.detailBlock, { backgroundColor: theme.colors.elevation.level1 }]}>
    <Text style={[styles.detailBlockLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    <Text style={[styles.detailBlockValue, { color: theme.colors.onSurface }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  searchInput: { borderRadius: 10, padding: 14, borderWidth: 1, minHeight: 56 },
  nicknameInput: { borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1 },
  placeholder: { fontSize: 16 },
  selectedRow: { flexDirection: 'row', alignItems: 'center' },
  typeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 16, fontWeight: '600' },
  selectedMeta: { fontSize: 12, marginTop: 2 },
  selectedBadges: { flexDirection: 'row', gap: 4 },
  miniBadge: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, fontSize: 9, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 16 },
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', margin: 12 },
  searchBar: { flex: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  searchSpinner: { marginLeft: 8 },
  resultsCount: { fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },
  legend: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  legendSectionTitle: { fontSize: 12, fontWeight: '600' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },
  loadMoreBtn: { padding: 14, alignItems: 'center', borderTopWidth: 1 },
  loadMoreText: { fontSize: 14, fontWeight: '600' },
  modalList: { maxHeight: 500 },
  emptyResults: { padding: 30, alignItems: 'center' },
  emptyResultsText: { fontSize: 16 },
  strainItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  strainInfo: { flex: 1 },
  strainName: { fontSize: 16, fontWeight: '600' },
  strainMeta: { fontSize: 12, marginTop: 2 },
  badgeRow: { alignItems: 'flex-end', gap: 4 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: '800' },
  difficultyBadge: { fontSize: 14 },
  detailCard: { borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1 },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  detailBadges: { flexDirection: 'column', gap: 4, marginRight: 10 },
  detailTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  detailTypeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  detailInfo: { flex: 1 },
  detailName: { fontSize: 20, fontWeight: '700' },
  detailBreeder: { fontSize: 13, marginTop: 2 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailBlock: { borderRadius: 8, padding: 8, width: '47%' },
  detailBlockLabel: { fontSize: 10, fontWeight: '500' },
  detailBlockValue: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 10, gap: 4 },
  tagsLabel: { fontSize: 12, marginRight: 6 },
  effectTag: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginRight: 4 },
  effectText: { fontSize: 11, fontWeight: '500' },
  flavorTag: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginRight: 4 },
  flavorText: { fontSize: 11, fontWeight: '500' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 24, fontWeight: 'bold' },
  qtyValue: { fontSize: 24, fontWeight: '700', marginHorizontal: 20, minWidth: 40, textAlign: 'center' },
  dateBtn: { borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1 },
  dateBtnText: { fontSize: 16, fontWeight: '500' },
  previewCard: { borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1 },
  previewTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  previewLabel: { fontSize: 14 },
  previewValue: { fontSize: 14, fontWeight: '600' },
  notesInput: { borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1 },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  submitText: { fontSize: 17, fontWeight: '700' },
  stageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  stageBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, gap: 4 },
  stageIcon: { fontSize: 16 },
  stageBtnText: { fontSize: 12, fontWeight: '500' },
});

export default AddPlantingScreen;
