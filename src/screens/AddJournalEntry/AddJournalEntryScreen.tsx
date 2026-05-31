import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlantDetailParamList } from '../PlantDetail';
import type { JournalEntryType, WateringData, NutritionData, PruningData } from '../../types/planting';
import { saveMediaToPlanting } from '../../utils/mediaStorage';
import TopHeader from '../../components/TopHeader';
import { createJournalEntry, addJournalEntry } from '../../data/journalStorage';
import { EntryTypeSelector, ENTRY_TYPE_CONFIG } from './EntryTypeSelector';
import { DateTimeSelector } from './DateTimeSelector';
import { MediaPicker } from './MediaPicker';
import { WateringForm } from './WateringForm';
import { NutritionForm } from './NutritionForm';
import { PruningForm } from './PruningForm';
import { FieldInput, styles as sharedStyles } from './shared';

type Props = NativeStackScreenProps<PlantDetailParamList, 'AddJournalEntry'>;

const AddJournalEntryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { plantingId, entryType } = route.params;
  const theme = useTheme();

  // Type selection
  const [selectedType, setSelectedType] = useState<JournalEntryType | null>(entryType ?? null);

  // Common fields
  const [note, setNote] = useState('');
  const [entryDate, setEntryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Watering
  const [waterVol, setWaterVol] = useState('');
  const [waterPh, setWaterPh] = useState('');
  const [waterMethod, setWaterMethod] = useState('');
  const [waterRunoff, setWaterRunoff] = useState(false);

  // Nutrition
  const [nutProduct, setNutProduct] = useState('');
  const [nutDose, setNutDose] = useState('');
  const [nutPh, setNutPh] = useState('');
  const [nutEc, setNutEc] = useState('');
  const [nutType, setNutType] = useState('');

  // Pruning
  const [pruneMethod, setPruneMethod] = useState('');
  const [pruneDetails, setPruneDetails] = useState('');

  // Media
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedType) return;

    if ((selectedType === 'photo' || selectedType === 'video') && !selectedMediaUri) {
      Alert.alert('Erro', selectedType === 'photo' ? 'Selecione ou tire uma foto.' : 'Selecione ou grave um vídeo.');
      return;
    }
    if (selectedType === 'nutrition' && !nutProduct) {
      Alert.alert('Erro', 'Informe o produto utilizado');
      return;
    }
    if (selectedType === 'nutrition' && !nutDose) {
      Alert.alert('Erro', 'Informe a dose (ml/L)');
      return;
    }
    if (selectedType === 'pruning' && !pruneMethod) {
      Alert.alert('Erro', 'Selecione o método de poda');
      return;
    }

    setSaving(true);

    const entryId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    let mediaUri: string | undefined = selectedMediaUri || undefined;
    if (mediaUri && (selectedType === 'photo' || selectedType === 'video')) {
      try {
        const mimeType = selectedType === 'video' ? 'video/mp4' : 'image/jpeg';
        mediaUri = await saveMediaToPlanting(plantingId, entryId, mediaUri, mimeType);
      } catch (err) {
        console.error('Erro ao salvar mídia:', err);
      }
    }

    const entry = createJournalEntry(plantingId, selectedType, {
      id: entryId,
      note: note || undefined,
      timestamp: entryDate.toISOString(),
      mediaUri,
    });

    if (selectedType === 'watering') {
      entry.watering = {
        volumeMl: waterVol ? parseFloat(waterVol) : undefined,
        ph: waterPh ? parseFloat(waterPh) : undefined,
        method: waterMethod || undefined,
        runoff: waterRunoff || undefined,
      } as WateringData;
    }

    if (selectedType === 'nutrition') {
      entry.nutrition = {
        product: nutProduct,
        doseMlPerL: parseFloat(nutDose),
        ph: nutPh ? parseFloat(nutPh) : undefined,
        ec: nutEc ? parseFloat(nutEc) : undefined,
        type: nutType || undefined,
      } as NutritionData;
    }

    if (selectedType === 'pruning') {
      entry.pruning = {
        method: pruneMethod,
        details: pruneDetails || undefined,
      } as PruningData;
    }

    await addJournalEntry(entry);
    setSaving(false);
    navigation.goBack();
  };

  // ─── No type selected → show selector ───
  if (!selectedType) {
    return <EntryTypeSelector onSelect={setSelectedType} theme={theme} />;
  }

  const config = ENTRY_TYPE_CONFIG[selectedType];

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title={config.label} showBack onBack={() => navigation.goBack()} />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.typeHeader, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.typeHeaderIcon}>{config.icon}</Text>
          <Text style={[styles.typeHeaderLabel, { color: config.color }]}>{config.label}</Text>
        </View>

        {/* Date/Time */}
        <DateTimeSelector
          entryDate={entryDate}
          onDateChange={setEntryDate}
          showDatePicker={showDatePicker}
          onShowDatePicker={setShowDatePicker}
          showTimePicker={showTimePicker}
          onShowTimePicker={setShowTimePicker}
          theme={theme}
        />

        {/* Note */}
        <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
            Nota / Observação (opcional)
          </Text>
          <TextInput
            style={[
              sharedStyles.textArea,
              {
                backgroundColor: theme.colors.elevation.level1,
                borderColor: theme.colors.outlineVariant,
                color: theme.colors.onSurface,
              },
            ]}
            placeholder="Ex: planta respondendo bem, folhas amarelando..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Type-specific forms */}
        {selectedType === 'watering' && (
          <WateringForm
            volume={waterVol} onVolumeChange={setWaterVol}
            ph={waterPh} onPhChange={setWaterPh}
            method={waterMethod} onMethodChange={setWaterMethod}
            runoff={waterRunoff} onRunoffChange={setWaterRunoff}
            theme={theme}
          />
        )}

        {selectedType === 'nutrition' && (
          <NutritionForm
            product={nutProduct} onProductChange={setNutProduct}
            dose={nutDose} onDoseChange={setNutDose}
            ph={nutPh} onPhChange={setNutPh}
            ec={nutEc} onEcChange={setNutEc}
            type={nutType} onTypeChange={setNutType}
            theme={theme}
          />
        )}

        {selectedType === 'pruning' && (
          <PruningForm
            method={pruneMethod} onMethodChange={setPruneMethod}
            details={pruneDetails} onDetailsChange={setPruneDetails}
            theme={theme}
          />
        )}

        {/* Media picker */}
        {(selectedType === 'photo' || selectedType === 'video') && (
          <MediaPicker
            selectedType={selectedType}
            selectedMediaUri={selectedMediaUri}
            onMediaSelected={setSelectedMediaUri}
            onMediaRemoved={() => setSelectedMediaUri(null)}
            theme={theme}
          />
        )}

        {/* Save */}
        <TouchableOpacity
          style={[
            sharedStyles.saveBtn,
            { backgroundColor: theme.colors.primary },
            saving && sharedStyles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={[sharedStyles.saveText, { color: theme.colors.onPrimary }]}>💾 Salvar registro</Text>
          )}
        </TouchableOpacity>

        {!entryType && (
          <TouchableOpacity style={sharedStyles.cancelBtn} onPress={() => setSelectedType(null)}>
            <Text style={[sharedStyles.cancelText, { color: theme.colors.onSurfaceVariant }]}>
              ← Voltar aos tipos
            </Text>
          </TouchableOpacity>
        )}
        {entryType && (
          <TouchableOpacity style={sharedStyles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={[sharedStyles.cancelText, { color: theme.colors.onSurfaceVariant }]}>
              ✕ Cancelar
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  typeHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  typeHeaderIcon: { fontSize: 28 },
  typeHeaderLabel: { fontSize: 20, fontWeight: '700' },
  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
});

export default AddJournalEntryScreen;
