import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Modal,
  ActivityIndicator, FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePlants } from '../context/PlantContext';
import { searchStrains, getStrainInfo } from '../data/strains';
import type { StrainInfo, CannabisGenetics, FloweringType } from '../data/strains';
import { addDaysToDate, formatDate } from '../utils/dateUtils';
import { createCannabisPlanting } from '../data/storage';

const AddPlantingScreen = () => {
  const { addPlanting } = usePlants();

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
      // Non-blocking search
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
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const harvestDatePreview = useMemo(() => {
    if (!selectedStrain) return null;
    const seedDateStr = seedDate.toISOString().split('T')[0];
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
    const seedDateStr = seedDate.toISOString().split('T')[0];
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
    );

    addPlanting(newPlanting);

    setSelectedStrain(undefined);
    setSearchText('');
    setAllResults([]);
    setVisibleCount(0);
    setSeedDate(new Date());
    setQuantity('1');
    setNotes('');
    setShowModal(false);

    Alert.alert('Sucesso!', `${selectedStrain.name} adicionada ao grow 🌱`);
  };

  // Colors
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
      style={[styles.strainItem, selectedStrain?.name === item.name && styles.strainItemSelected]}
      onPress={() => handleSelectStrain(item)}
      activeOpacity={0.6}
    >
      <View style={[styles.typeDot, { backgroundColor: geneticsColor(item.genetics) }]} />
      <View style={styles.strainInfo}>
        <Text style={styles.strainName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.strainMeta} numberOfLines={1}>
          {item.breeder} · THC {item.thcMin}-{item.thcMax}% · Flora {item.floweringDays}d
        </Text>
      </View>
      <View style={styles.badgeRow}>
        {/* Genetics badge */}
        <Text style={[styles.typeBadge, { backgroundColor: geneticsColor(item.genetics) + '22', color: geneticsColor(item.genetics) }]}>
          {item.genetics.toUpperCase().slice(0, 3)}
        </Text>
        {/* Flowering type badge */}
        <Text style={[styles.typeBadge, { backgroundColor: floweringTypeColor(item.floweringType) + '22', color: floweringTypeColor(item.floweringType) }]}>
          {item.floweringType === 'autoflower' ? 'AUTO' : 'FOTO'}
        </Text>
        <Text style={styles.difficultyBadge}>
          {item.difficulty === 'fácil' ? '🟢' : item.difficulty === 'média' ? '🟡' : '🔴'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [selectedStrain, handleSelectStrain]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Strain search */}
        <Text style={styles.label}>🌿 Buscar strain</Text>
        <TouchableOpacity
          style={styles.searchInput}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
        >
          {selectedStrain ? (
            <View style={styles.selectedRow}>
              <View style={[styles.typeDot, { backgroundColor: geneticsColor(selectedStrain.genetics) }]} />
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedStrain.name}</Text>
                <Text style={styles.selectedMeta}>
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
            <Text style={styles.placeholder}>Toque para buscar 8000+ strains...</Text>
          )}
        </TouchableOpacity>

        {/* Search Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Strain</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search bar */}
              <View style={styles.searchBarWrapper}>
                <TextInput
                  style={styles.searchBar}
                  placeholder="Digite para buscar (nome, breeder, efeito, sabor)..."
                  placeholderTextColor="#999"
                  value={searchText}
                  onChangeText={handleSearch}
                  autoFocus
                  returnKeyType="search"
                />
                {isSearching && (
                  <ActivityIndicator style={styles.searchSpinner} size="small" color="#2e7d32" />
                )}
              </View>

              {/* Results count */}
              {visibleResults.length > 0 && (
                <Text style={styles.resultsCount}>
                  {totalResults} strains encontradas{visibleResults.length < totalResults ? `, mostrando ${visibleResults.length}` : ''}
                </Text>
              )}

              {/* Legend */}
              <View style={styles.legend}>
                <Text style={styles.legendSectionTitle}>Genética:</Text>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#1565C0' }]} />
                  <Text style={styles.legendText}>Sativa</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#7B1FA2' }]} />
                  <Text style={styles.legendText}>Indica</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
                  <Text style={styles.legendText}>Hybrid</Text>
                </View>
                <Text style={[styles.legendSectionTitle, { marginLeft: 8 }]}>Floração:</Text>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
                  <Text style={styles.legendText}>Auto</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#455A64' }]} />
                  <Text style={styles.legendText}>Foto</Text>
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
                      <Text style={styles.emptyResultsText}>
                        {isSearching ? 'Buscando...' : 'Nenhuma strain encontrada'}
                      </Text>
                    </View>
                  ) : null
                }
                ListFooterComponent={
                  visibleCount < totalResults ? (
                    <TouchableOpacity
                      style={styles.loadMoreBtn}
                      onPress={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, totalResults))}
                    >
                      <Text style={styles.loadMoreText}>
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
          <View style={styles.detailCard}>
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
                <Text style={styles.detailName}>{selectedStrain.name}</Text>
                <Text style={styles.detailBreeder}>{selectedStrain.breeder}</Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <DetailItem label="THC" value={`${selectedStrain.thcMin}-${selectedStrain.thcMax}%`} />
              <DetailItem label="Floração" value={`${selectedStrain.floweringDays}d`} />
              {selectedStrain.floweringType === 'autoflower' && selectedStrain.autoflowerDays && (
                <DetailItem label="Semente→Colheita" value={`${selectedStrain.autoflowerDays}d`} />
              )}
              <DetailItem label="Altura" value={selectedStrain.height} />
              <DetailItem label="Yield" value={selectedStrain.yield} />
              <DetailItem label="Dificuldade" value={selectedStrain.difficulty} />
            </View>

            {selectedStrain.effects.length > 0 && (
              <View style={styles.tagsRow}>
                <Text style={styles.tagsLabel}>Efeitos:</Text>
                {selectedStrain.effects.map((e) => (
                  <View key={e} style={styles.effectTag}>
                    <Text style={styles.effectText}>{e}</Text>
                  </View>
                ))}
              </View>
            )}

            {selectedStrain.flavors.length > 0 && (
              <View style={styles.tagsRow}>
                <Text style={styles.tagsLabel}>Sabores:</Text>
                {selectedStrain.flavors.map((f) => (
                  <View key={f} style={styles.flavorTag}>
                    <Text style={styles.flavorText}>{f}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Quantity */}
        <Text style={styles.label}>🌱 Quantidade de plantas</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(String(Math.max(1, (parseInt(quantity) || 1) - 1)))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(String(Math.min(50, (parseInt(quantity) || 1) + 1)))}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Seed date */}
        <Text style={styles.label}>📅 Data da semente/germinação</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateBtnText}>{formatDate(seedDate.toISOString().split('T')[0])}</Text>
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

        {/* Harvest preview */}
        {selectedStrain && harvestDatePreview && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>📋 Previsão</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Semeadura:</Text>
              <Text style={styles.previewValue}>{formatDate(seedDate.toISOString().split('T')[0])}</Text>
            </View>
            {selectedStrain.floweringType === 'photoperiodic' && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Floração (est.):</Text>
                <Text style={styles.previewValue}>{formatDate(addDaysToDate(seedDate.toISOString().split('T')[0], 30))}</Text>
              </View>
            )}
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Colheita (est.):</Text>
              <Text style={styles.previewValue}>{formatDate(harvestDatePreview)}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        <Text style={styles.label}>📝 Observações (opcional)</Text>
        <TextInput
          style={[styles.notesInput, styles.textArea]}
          placeholder="Ex: Indoor, LED 300W, vaso 11L..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !selectedStrain && styles.submitBtnDisabled]}
          disabled={!selectedStrain}
          onPress={handleAdd}
        >
          <Text style={styles.submitText}>🌱 Adicionar ao grow</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailBlock}>
    <Text style={styles.detailBlockLabel}>{label}</Text>
    <Text style={styles.detailBlockValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 14 },
  searchInput: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#ddd', minHeight: 56,
  },
  placeholder: { fontSize: 16, color: '#999' },
  selectedRow: { flexDirection: 'row', alignItems: 'center' },
  typeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 16, fontWeight: '600', color: '#333' },
  selectedMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  selectedBadges: { flexDirection: 'row', gap: 4 },
  miniBadge: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, fontSize: 9, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '90%', paddingBottom: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 16, color: '#666' },
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', margin: 12 },
  searchBar: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 16,
  },
  searchSpinner: { marginLeft: 8 },
  resultsCount: { fontSize: 12, color: '#999', paddingHorizontal: 16, marginBottom: 4 },
  legend: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  legendSectionTitle: { fontSize: 12, color: '#999', fontWeight: '600' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#666' },
  loadMoreBtn: { padding: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  loadMoreText: { fontSize: 14, color: '#2e7d32', fontWeight: '600' },
  modalList: { maxHeight: 500 },
  emptyResults: { padding: 30, alignItems: 'center' },
  emptyResultsText: { fontSize: 16, color: '#999' },
  strainItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  strainItemSelected: { backgroundColor: '#e8f5e9' },
  strainInfo: { flex: 1 },
  strainName: { fontSize: 16, fontWeight: '600', color: '#333' },
  strainMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  badgeRow: { alignItems: 'flex-end', gap: 4 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: '800' },
  difficultyBadge: { fontSize: 14 },
  detailCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  detailBadges: { flexDirection: 'column', gap: 4, marginRight: 10 },
  detailTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  detailTypeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  detailInfo: { flex: 1 },
  detailName: { fontSize: 20, fontWeight: '700', color: '#333' },
  detailBreeder: { fontSize: 13, color: '#888', marginTop: 2 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailBlock: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 8, width: '47%' },
  detailBlockLabel: { fontSize: 10, color: '#999', fontWeight: '500' },
  detailBlockValue: { fontSize: 13, color: '#333', fontWeight: '600', marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 10, gap: 4 },
  tagsLabel: { fontSize: 12, color: '#999', marginRight: 6 },
  effectTag: { backgroundColor: '#e8f5e9', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginRight: 4 },
  effectText: { fontSize: 11, color: '#2e7d32', fontWeight: '500' },
  flavorTag: { backgroundColor: '#fff3e0', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginRight: 4 },
  flavorText: { fontSize: 11, color: '#e65100', fontWeight: '500' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  qtyValue: { fontSize: 24, fontWeight: '700', color: '#333', marginHorizontal: 20, minWidth: 40, textAlign: 'center' },
  dateBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  dateBtnText: { fontSize: 16, color: '#333', fontWeight: '500' },
  previewCard: { backgroundColor: '#fff3e0', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#ffe0b2' },
  previewTitle: { fontSize: 15, fontWeight: '700', color: '#e65100', marginBottom: 8 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  previewLabel: { fontSize: 14, color: '#666' },
  previewValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  notesInput: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', color: '#333' },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#2e7d32', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  submitBtnDisabled: { backgroundColor: '#a5d6a7' },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

export default AddPlantingScreen;
