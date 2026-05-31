import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform, Image,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { saveMediaToPlanting, deleteEntryMedia } from '../utils/mediaStorage';
import TopHeader from '../components/TopHeader';

// Helpers for web HTML date/time inputs
const toIsoDateString = (d: Date) => d.toISOString().slice(0, 10);
const toIsoTimeString = (d: Date) => d.toTimeString().slice(0, 5);
const fromIsoDateAndTime = (dateStr: string, timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  const dt = new Date(dateStr + 'T00:00:00');
  dt.setHours(h, m);
  return dt;
};
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlantDetailParamList } from './PlantDetailScreen';
import type { JournalEntryType, WateringData, NutritionData, PruningData } from '../types/planting';
import { createJournalEntry, addJournalEntry } from '../data/journalStorage';

type Props = NativeStackScreenProps<PlantDetailParamList, 'AddJournalEntry'>;

const ENTRY_TYPES: { type: JournalEntryType; icon: string; label: string; color: string; desc: string }[] = [
  { type: 'photo', icon: '📷', label: 'Foto', color: '#7B1FA2', desc: 'Tirar foto ou selecionar da galeria' },
  { type: 'video', icon: '🎥', label: 'Vídeo', color: '#C2185B', desc: 'Gravar ou selecionar vídeo' },
  { type: 'watering', icon: '💧', label: 'Rega', color: '#0288D1', desc: 'Registrar irrigação' },
  { type: 'nutrition', icon: '🧪', label: 'Nutrição', color: '#2E7D32', desc: 'Aplicação de fertilizante/nutriente' },
  { type: 'pruning', icon: '✂️', label: 'Poda', color: '#E65100', desc: 'Registrar poda/treinamento' },
  { type: 'comment', icon: '💬', label: 'Comentário', color: '#1565C0', desc: 'Nota ou observação livre' },
];

const PRUNING_METHODS = ['Topping', 'Fimming', 'LST', 'HST', 'Defoliação', 'Lollipop', 'Super Cropping', 'ScrOG', 'Outra'];
const NUTRITION_TYPES = ['Veg', 'Flora', 'PK Boost', 'Micro', 'Cal-Mag', 'Enzimas', 'Outro'];
const WATERING_METHODS = ['Manual', 'Gotejamento', 'Inundação', 'Regador', 'Outro'];

const AddJournalEntryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { plantingId, entryType } = route.params;
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<JournalEntryType | null>(entryType ?? null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [entryDate, setEntryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [waterVol, setWaterVol] = useState('');
  const [waterPh, setWaterPh] = useState('');
  const [waterMethod, setWaterMethod] = useState('');
  const [waterRunoff, setWaterRunoff] = useState(false);

  const [nutProduct, setNutProduct] = useState('');
  const [nutDose, setNutDose] = useState('');
  const [nutPh, setNutPh] = useState('');
  const [nutEc, setNutEc] = useState('');
  const [nutType, setNutType] = useState('');

  const [pruneMethod, setPruneMethod] = useState('');
  const [pruneDetails, setPruneDetails] = useState('');

  // Media state
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const [pickingMedia, setPickingMedia] = useState(false);

  /** Request camera/gallery permission and pick media */
  const pickMedia = async (useCamera: boolean) => {
    if (selectedType !== 'photo' && selectedType !== 'video') return;

    try {
      let result: ImagePicker.ImagePickerResult | ImagePicker.ImagePickerResult;

      if (useCamera) {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          Alert.alert('Permissão negada', 'Permita acesso à câmera nas configurações.');
          return;
        }
        if (selectedType === 'video') {
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos'],
            quality: 0.7,
            videoMaxDuration: 60,
          });
        } else {
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: false,
          });
        }
      } else {
        const galleryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPerm.granted) {
          Alert.alert('Permissão negada', 'Permita acesso à galeria nas configurações.');
          return;
        }
        if (selectedType === 'video') {
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            quality: 0.7,
          });
        } else {
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: false,
          });
        }
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedMediaUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Erro ao selecionar mídia:', err);
      Alert.alert('Erro', 'Não foi possível acessar a mídia.');
    } finally {
      setPickingMedia(false);
    }
  };

  const handleSave = async () => {
    if (!selectedType) return;

    // Photo/video: require media
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

    // Generate entry ID upfront so we can use it for media storage
    const entryId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    // Move picked media to persistent storage
    let mediaUri: string | undefined = selectedMediaUri || undefined;
    if (mediaUri && (selectedType === 'photo' || selectedType === 'video')) {
      try {
        const mimeType = selectedType === 'video' ? 'video/mp4' : 'image/jpeg';
        mediaUri = await saveMediaToPlanting(plantingId, entryId, mediaUri, mimeType);
      } catch (err) {
        console.error('Erro ao salvar mídia:', err);
        // Continue without media rather than failing completely
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

  const webInputStyle: React.CSSProperties = {
    flex: 1, padding: '12px', fontSize: 14, borderRadius: 10,
    border: `1px solid ${theme.colors.outlineVariant}`,
    backgroundColor: theme.colors.elevation.level1,
    color: theme.colors.onSurface,
    fontFamily: 'inherit', boxSizing: 'border-box' as const,
  };

  if (!selectedType) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Que tipo de registro?</Text>
        <View style={styles.typeGrid}>
          {ENTRY_TYPES.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[styles.typeCard, { borderColor: item.color + '33', backgroundColor: theme.colors.surface }]}
              onPress={() => setSelectedType(item.type)}
            >
              <Text style={styles.typeIcon}>{item.icon}</Text>
              <Text style={[styles.typeLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={[styles.typeDesc, { color: theme.colors.onSurfaceVariant }]}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const config = ENTRY_TYPES.find((e) => e.type === selectedType)!;

  return (
    <View style={{ flex: 1 }}>
      <TopHeader title={config.label} showBack onBack={() => navigation.goBack()} />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.typeHeader, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.typeHeaderIcon}>{config.icon}</Text>
        <Text style={[styles.typeHeaderLabel, { color: config.color }]}>{config.label}</Text>
      </View>

      {/* ─── Date/Time ─── */}
      <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>Data e hora do registro</Text>
        {Platform.OS === 'web' ? (
          <View style={styles.dateTimeRow}>
            <input
              type="date"
              value={toIsoDateString(entryDate)}
              max={toIsoDateString(new Date())}
              onChange={(e) => {
                if (e.target.value) {
                  setEntryDate(fromIsoDateAndTime(e.target.value, toIsoTimeString(entryDate)));
                }
              }}
              style={webInputStyle}
            />
            <input
              type="time"
              value={toIsoTimeString(entryDate)}
              onChange={(e) => {
                if (e.target.value) {
                  setEntryDate(fromIsoDateAndTime(toIsoDateString(entryDate), e.target.value));
                }
              }}
              style={webInputStyle}
            />
          </View>
        ) : (
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeIcon}>🗓️</Text>
              <Text style={[styles.dateTimeText, { color: theme.colors.onSurface }]}>
                {entryDate.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeIcon}>🕐</Text>
              <Text style={[styles.dateTimeText, { color: theme.colors.onSurface }]}>
                {entryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={[styles.dateTimeHint, { color: theme.colors.outline }]}>
          Permite registrar eventos passados caso tenha esquecido
        </Text>
      </View>

      {/* ─── Note (common to all) ─── */}
      <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>Nota / Observação (opcional)</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface }]}
          placeholder="Ex: planta respondendo bem, folhas amarelando..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* ─── Date/Time Pickers (native only) ─── */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={entryDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) setEntryDate(selectedDate);
          }}
        />
      )}
      {Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          value={entryDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedDate) {
              const merged = new Date(entryDate);
              merged.setHours(selectedDate.getHours(), selectedDate.getMinutes());
              setEntryDate(merged);
            }
          }}
        />
      )}

      {/* ─── Watering ─── */}
      {selectedType === 'watering' && (
        <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>Detalhes da rega</Text>
          <NumberInput label="Volume (ml)" value={waterVol} onChange={setWaterVol} placeholder="500" theme={theme} />
          <NumberInput label="pH da água" value={waterPh} onChange={setWaterPh} placeholder="6.5" decimal theme={theme} />
          <Text style={[styles.subLabel, { color: theme.colors.onSurfaceVariant }]}>Método de rega:</Text>
          <OptionButtons options={WATERING_METHODS} selected={waterMethod} onSelect={setWaterMethod} theme={theme} />
          <TouchableOpacity
            style={[styles.checkbox, { borderColor: theme.colors.outlineVariant }, waterRunoff && { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => setWaterRunoff(!waterRunoff)}
          >
            <Text style={[styles.checkboxText, { color: theme.colors.onSurface }]}>{waterRunoff ? '☑️' : '⬜'} Runoff (escoamento)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Nutrition ─── */}
      {selectedType === 'nutrition' && (
        <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>Detalhes da nutrição</Text>
          <FieldInput label="Produto *" value={nutProduct} onChange={setNutProduct} placeholder="Ex: BioGrow, Cal-Mag..." theme={theme} />
          <NumberInput label="Dose (ml/L) *" value={nutDose} onChange={setNutDose} placeholder="2" decimal theme={theme} />
          <NumberInput label="pH da solução" value={nutPh} onChange={setNutPh} placeholder="6.0" decimal theme={theme} />
          <NumberInput label="EC (mS/cm)" value={nutEc} onChange={setNutEc} placeholder="1.2" decimal theme={theme} />
          <Text style={[styles.subLabel, { color: theme.colors.onSurfaceVariant }]}>Tipo:</Text>
          <OptionButtons options={NUTRITION_TYPES} selected={nutType} onSelect={setNutType} theme={theme} />
        </View>
      )}

      {/* ─── Pruning ─── */}
      {selectedType === 'pruning' && (
        <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>Detalhes da poda</Text>
          <Text style={[styles.subLabel, { color: theme.colors.onSurfaceVariant }]}>Método *:</Text>
          <OptionButtons options={PRUNING_METHODS} selected={pruneMethod} onSelect={setPruneMethod} theme={theme} />
          <FieldInput label="Detalhes" value={pruneDetails} onChange={setPruneDetails} placeholder="Ex: removi 30% das folhas baixas..." multiline theme={theme} />
        </View>
      )}

      {/* ─── Photo / Video ─── */}
      {(selectedType === 'photo' || selectedType === 'video') && (
        <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
          {selectedMediaUri ? (
            <View>
              {selectedType === 'photo' ? (
                <Image
                  source={{ uri: selectedMediaUri }}
                  style={styles.mediaPreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.videoPreview, { backgroundColor: theme.colors.elevation.level1 }]}>
                  <Text style={{ fontSize: 48 }}>🎥</Text>
                  <Text style={[styles.videoPreviewText, { color: theme.colors.onSurfaceVariant }]}>Vídeo selecionado</Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.mediaRemoveBtn, { backgroundColor: theme.colors.errorContainer }]}
                onPress={() => setSelectedMediaUri(null)}
              >
                <Text style={[styles.mediaRemoveText, { color: theme.colors.onErrorContainer }]}>✕ Remover</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.mediaBtn, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.primary, marginBottom: 10 }]}
                onPress={() => { setPickingMedia(true); pickMedia(true); }}
                disabled={pickingMedia}
              >
                <Text style={styles.mediaBtnIcon}>{selectedType === 'photo' ? '📷' : '🎥'}</Text>
                <Text style={[styles.mediaBtnText, { color: theme.colors.primary }]}>
                  {selectedType === 'photo' ? 'Tirar foto' : 'Gravar vídeo'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mediaBtn, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant }]}
                onPress={() => { setPickingMedia(true); pickMedia(false); }}
                disabled={pickingMedia}
              >
                <Text style={styles.mediaBtnIcon}>🖼️</Text>
                <Text style={[styles.mediaBtnText, { color: theme.colors.onSurfaceVariant }]}>
                  {selectedType === 'photo' ? 'Selecionar da galeria' : 'Selecionar vídeo'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* ─── Save ─── */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: theme.colors.primary }, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={[styles.saveText, { color: theme.colors.onPrimary }]}>💾 Salvar registro</Text>
        )}
      </TouchableOpacity>
      {!entryType && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedType(null)}>
          <Text style={[styles.cancelText, { color: theme.colors.onSurfaceVariant }]}>← Voltar aos tipos</Text>
        </TouchableOpacity>
      )}
      {entryType && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelText, { color: theme.colors.onSurfaceVariant }]}>✕ Cancelar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
    </View>
  );
};

// ─── Sub-components ───

const FieldInput: React.FC<{
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; theme: any;
}> = ({ label, value, onChange, placeholder, multiline, theme }) => (
  <View style={styles.inputWrap}>
    <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    <TextInput
      style={[styles.input, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface }, multiline && styles.textArea]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.onSurfaceVariant}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

const NumberInput: React.FC<{
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; decimal?: boolean; theme: any;
}> = ({ label, value, onChange, placeholder, theme }) => (
  <View style={styles.inputWrap}>
    <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    <TextInput
      style={[styles.input, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface }]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.onSurfaceVariant}
      keyboardType="numeric"
    />
  </View>
);

const OptionButtons: React.FC<{
  options: string[]; selected: string; onSelect: (v: string) => void; theme: any;
}> = ({ options, selected, onSelect, theme }) => (
  <View style={styles.optionsRow}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[
          styles.optionBtn,
          { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant },
          opt === selected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
        ]}
        onPress={() => onSelect(opt === selected ? '' : opt)}
      >
        <Text style={[
          styles.optionText,
          { color: theme.colors.onSurfaceVariant },
          opt === selected && { color: theme.colors.onPrimary },
        ]}>{opt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', padding: 16, textAlign: 'center' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10, justifyContent: 'center' },
  typeCard: {
    width: '45%', padding: 16, borderRadius: 12,
    borderWidth: 1, alignItems: 'center',
  },
  typeIcon: { fontSize: 32, marginBottom: 6 },
  typeLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  typeDesc: { fontSize: 11, textAlign: 'center' },

  typeHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  typeHeaderIcon: { fontSize: 28 },
  typeHeaderLabel: { fontSize: 20, fontWeight: '700' },

  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  subLabel: { fontSize: 12, marginBottom: 6, marginTop: 10 },
  inputWrap: { marginBottom: 10 },
  inputLabel: { fontSize: 12, marginBottom: 4 },
  input: {
    borderWidth: 1, borderRadius: 8, padding: 10,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' as const },

  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1,
  },
  optionText: { fontSize: 12, fontWeight: '500' },

  checkbox: { padding: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1 },
  checkboxText: { fontSize: 14 },

  mediaBtn: {
    padding: 20, borderRadius: 12,
    borderWidth: 2, borderStyle: 'dashed' as const,
    alignItems: 'center',
  },
  mediaBtnIcon: { fontSize: 40, marginBottom: 8 },
  mediaBtnText: { fontSize: 14, fontWeight: '600' },
  mediaHint: { fontSize: 11, textAlign: 'center' as const, marginTop: 6 },
  mediaPreview: {
    width: '100%', height: 250, borderRadius: 12, marginBottom: 10,
  },
  videoPreview: {
    width: '100%', height: 180, borderRadius: 12, marginBottom: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  videoPreviewText: { fontSize: 14, marginTop: 8 },
  mediaRemoveBtn: {
    alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20,
  },
  mediaRemoveText: { fontSize: 14, fontWeight: '600' },

  saveBtn: { margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 16, alignItems: 'center', marginBottom: 30 },
  cancelText: { fontSize: 14 },

  dateTimeRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  dateTimeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  dateTimeIcon: { fontSize: 16, marginRight: 8 },
  dateTimeText: { fontSize: 14, fontWeight: '500' },
  dateTimeHint: { fontSize: 11, fontStyle: 'italic' as const, marginTop: 4 },
});

export default AddJournalEntryScreen;
