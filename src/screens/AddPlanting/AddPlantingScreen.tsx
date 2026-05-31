import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePlants } from '../../context/PlantContext';
import type { StrainInfo, CannabisGenetics, FloweringType } from '../../data/strains';
import type { GrowthStage } from '../../types/planting';
import { addDaysToDate, toLocalIsoDate, stageIcon, stageColor, stageLabel } from '../../utils/dateUtils';
import { useSettings } from '../../context/SettingsContext';
import { createCannabisPlanting } from '../../data/storage';
import TopHeader from '../../components/TopHeader';
import { StrainSearchModal } from './StrainSearchModal';
import { StrainDetailCard } from './StrainDetailCard';
import { StageSelector } from './StageSelector';
import { styles } from './shared';

const toIsoDateString = (d: Date) => d.toISOString().slice(0, 10);
const fromIsoDateString = (s: string) => new Date(s + 'T00:00:00');

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

const AddPlantingScreen = () => {
  const { addPlanting } = usePlants();
  const { formatDate } = useSettings();
  const theme = useTheme();

  // Strain selection
  const [searchText, setSearchText] = useState('');
  const [selectedStrain, setSelectedStrain] = useState<StrainInfo | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchText(query);
    setSelectedStrain(undefined);
  }, []);

  const handleSelectStrain = useCallback((strain: StrainInfo) => {
    setSelectedStrain(strain);
    setSearchText(strain.name);
    setShowModal(false);
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
    setSeedDate(new Date());
    setNickname('');
    setQuantity('1');
    setNotes('');
    setSelectedStage('germinação');
    setShowModal(false);

    Alert.alert('Sucesso!', `${selectedStrain.name} adicionada ao grow 🌱`);
  };

  const webInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    fontSize: 16,
    borderRadius: 10,
    border: `1px solid ${theme.colors.outlineVariant}`,
    backgroundColor: theme.colors.elevation.level1,
    color: theme.colors.onSurface,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title="Adicionar Planta" />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
              <Text style={[styles.placeholder, { color: theme.colors.onSurfaceVariant }]}>
                Toque para buscar 8000+ strains...
              </Text>
            )}
          </TouchableOpacity>

          {/* Strain details */}
          {selectedStrain && (
            <StrainDetailCard strain={selectedStrain} theme={theme} />
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
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => setQuantity(String(Math.max(1, (parseInt(quantity) || 1) - 1)))}
            >
              <Text style={[styles.qtyBtnText, { color: theme.colors.onPrimaryContainer }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.qtyValue, { color: theme.colors.onSurface }]}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => setQuantity(String(Math.min(50, (parseInt(quantity) || 1) + 1)))}
            >
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
              <TouchableOpacity
                style={[styles.dateBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateBtnText, { color: theme.colors.onSurface }]}>
                  {formatDate(toLocalIsoDate(seedDate))}
                </Text>
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
                <Text style={[styles.previewLabel, { color: theme.colors.onSecondaryContainer }]}>
                  {formatDate(toLocalIsoDate(seedDate))}
                </Text>
                <Text style={[styles.previewValue, { color: theme.colors.onSecondaryContainer }]}>
                  {formatDate(harvestDatePreview)}
                </Text>
              </View>
            </View>
          )}

          {/* Growth stage */}
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>🌱 Estágio atual</Text>
          <StageSelector
            selectedStage={selectedStage}
            onSelect={setSelectedStage}
            theme={theme}
          />

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

      <StrainSearchModal
        visible={showModal}
        selectedStrain={selectedStrain}
        onClose={() => setShowModal(false)}
        onSelect={handleSelectStrain}
        theme={theme}
      />
    </View>
  );
};

export default AddPlantingScreen;
