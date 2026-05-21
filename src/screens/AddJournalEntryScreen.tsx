import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [selectedType, setSelectedType] = useState<JournalEntryType | null>(entryType ?? null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  // Data/hora do registro (permite datas passadas)
  const [entryDate, setEntryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Watering fields
  const [waterVol, setWaterVol] = useState('');
  const [waterPh, setWaterPh] = useState('');
  const [waterMethod, setWaterMethod] = useState('');
  const [waterRunoff, setWaterRunoff] = useState(false);

  // Nutrition fields
  const [nutProduct, setNutProduct] = useState('');
  const [nutDose, setNutDose] = useState('');
  const [nutPh, setNutPh] = useState('');
  const [nutEc, setNutEc] = useState('');
  const [nutType, setNutType] = useState('');

  // Pruning fields
  const [pruneMethod, setPruneMethod] = useState('');
  const [pruneDetails, setPruneDetails] = useState('');

  const handleSave = async () => {
    if (!selectedType) return;

    // Validate required fields
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

    const entry = createJournalEntry(plantingId, selectedType, {
      note: note || undefined,
      timestamp: entryDate.toISOString(),
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

  if (!selectedType) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Que tipo de registro?</Text>
        <View style={styles.typeGrid}>
          {ENTRY_TYPES.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[styles.typeCard, { borderColor: item.color + '33' }]}
              onPress={() => setSelectedType(item.type)}
            >
              <Text style={styles.typeIcon}>{item.icon}</Text>
              <Text style={[styles.typeLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={styles.typeDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const config = ENTRY_TYPES.find((e) => e.type === selectedType)!;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.typeHeader}>
        <Text style={styles.typeHeaderIcon}>{config.icon}</Text>
        <Text style={[styles.typeHeaderLabel, { color: config.color }]}>{config.label}</Text>
      </View>

      {/* ─── Date/Time ─── */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Data e hora do registro</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateTimeBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeIcon}>📅</Text>
            <Text style={styles.dateTimeText}>
              {entryDate.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateTimeBtn}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeIcon}>🕐</Text>
            <Text style={styles.dateTimeText}>
              {entryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.dateTimeHint}>
          Permite registrar eventos passados caso tenha esquecido
        </Text>
      </View>

      {/* ─── Note (common to all) ─── */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Nota / Observação (opcional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ex: planta respondendo bem, folhas amarelando..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* ─── Date Picker ─── */}
      {showDatePicker && (
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

      {/* ─── Time Picker ─── */}
      {showTimePicker && (
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
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Detalhes da rega</Text>
          <NumberInput label="Volume (ml)" value={waterVol} onChange={setWaterVol} placeholder="500" />
          <NumberInput label="pH da água" value={waterPh} onChange={setWaterPh} placeholder="6.5" decimal />
          <Text style={styles.subLabel}>Método de rega:</Text>
          <OptionButtons options={WATERING_METHODS} selected={waterMethod} onSelect={setWaterMethod} />
          <TouchableOpacity
            style={[styles.checkbox, waterRunoff && styles.checkboxActive]}
            onPress={() => setWaterRunoff(!waterRunoff)}
          >
            <Text style={styles.checkboxText}>{waterRunoff ? '☑️' : '⬜'} Runoff (escoamento)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Nutrition ─── */}
      {selectedType === 'nutrition' && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Detalhes da nutrição</Text>
          <FieldInput label="Produto *" value={nutProduct} onChange={setNutProduct} placeholder="Ex: BioGrow, Cal-Mag..." />
          <NumberInput label="Dose (ml/L) *" value={nutDose} onChange={setNutDose} placeholder="2" decimal />
          <NumberInput label="pH da solução" value={nutPh} onChange={setNutPh} placeholder="6.0" decimal />
          <NumberInput label="EC (mS/cm)" value={nutEc} onChange={setNutEc} placeholder="1.2" decimal />
          <Text style={styles.subLabel}>Tipo:</Text>
          <OptionButtons options={NUTRITION_TYPES} selected={nutType} onSelect={setNutType} />
        </View>
      )}

      {/* ─── Pruning ─── */}
      {selectedType === 'pruning' && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Detalhes da poda</Text>
          <Text style={styles.subLabel}>Método *:</Text>
          <OptionButtons options={PRUNING_METHODS} selected={pruneMethod} onSelect={setPruneMethod} />
          <FieldInput label="Detalhes" value={pruneDetails} onChange={setPruneDetails} placeholder="Ex: removi 30% das folhas baixas..." multiline />
        </View>
      )}

      {/* ─── Photo / Video placeholder ─── */}
      {(selectedType === 'photo' || selectedType === 'video') && (
        <View style={styles.fieldGroup}>
          <TouchableOpacity style={styles.mediaBtn}>
            <Text style={styles.mediaBtnIcon}>{selectedType === 'photo' ? '📷' : '🎥'}</Text>
            <Text style={styles.mediaBtnText}>
              {selectedType === 'photo' ? 'Tirar foto ou selecionar' : 'Gravar ou selecionar vídeo'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.mediaHint}>Câmera/galeria será implementada com expo-image-picker</Text>
        </View>
      )}

      {/* ─── Save ─── */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>💾 Salvar registro</Text>
        )}
      </TouchableOpacity>
      {!entryType && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedType(null)}>
          <Text style={styles.cancelText}>← Voltar aos tipos</Text>
        </TouchableOpacity>
      )}
      {entryType && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>✕ Cancelar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

// ─── Sub-components ───

const FieldInput: React.FC<{
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}> = ({ label, value, onChange, placeholder, multiline }) => (
  <View style={styles.inputWrap}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#ccc"
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

const NumberInput: React.FC<{
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; decimal?: boolean;
}> = ({ label, value, onChange, placeholder }) => (
  <View style={styles.inputWrap}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#ccc"
      keyboardType="numeric"
    />
  </View>
);

const OptionButtons: React.FC<{
  options: string[]; selected: string; onSelect: (v: string) => void;
}> = ({ options, selected, onSelect }) => (
  <View style={styles.optionsRow}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[styles.optionBtn, opt === selected && styles.optionBtnActive]}
        onPress={() => onSelect(opt === selected ? '' : opt)}
      >
        <Text style={[styles.optionText, opt === selected && styles.optionTextActive]}>{opt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', padding: 16, textAlign: 'center' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10, justifyContent: 'center' },
  typeCard: {
    width: '45%', padding: 16, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1, alignItems: 'center',
  },
  typeIcon: { fontSize: 32, marginBottom: 6 },
  typeLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  typeDesc: { fontSize: 11, color: '#888', textAlign: 'center' },

  typeHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', gap: 10 },
  typeHeaderIcon: { fontSize: 28 },
  typeHeaderLabel: { fontSize: 20, fontWeight: '700' },

  fieldGroup: { backgroundColor: '#fff', padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  subLabel: { fontSize: 12, color: '#666', marginBottom: 6, marginTop: 10 },
  inputWrap: { marginBottom: 10 },
  inputLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10,
    fontSize: 15, backgroundColor: '#fafafa',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#e0e0e0',
  },
  optionBtnActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  optionText: { fontSize: 12, color: '#555', fontWeight: '500' },
  optionTextActive: { color: '#fff', fontWeight: '600' },

  checkbox: { padding: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#e8f5e9', borderRadius: 8 },
  checkboxText: { fontSize: 14, color: '#333' },

  mediaBtn: {
    padding: 20, borderRadius: 12, backgroundColor: '#f8f8f8',
    borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed',
    alignItems: 'center',
  },
  mediaBtnIcon: { fontSize: 40, marginBottom: 8 },
  mediaBtnText: { fontSize: 14, color: '#666' },
  mediaHint: { fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 6 },

  saveBtn: { margin: 16, padding: 16, borderRadius: 12, backgroundColor: '#2e7d32', alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 16, alignItems: 'center', marginBottom: 30 },
  cancelText: { fontSize: 14, color: '#999' },

  dateTimeRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  dateTimeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, backgroundColor: '#f8f9fa',
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  dateTimeIcon: { fontSize: 16, marginRight: 8 },
  dateTimeText: { fontSize: 14, color: '#333', fontWeight: '500' },
  dateTimeHint: { fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 4 },
});

export default AddJournalEntryScreen;
