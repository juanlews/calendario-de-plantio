import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FieldInput, NumberInput, OptionButtons, SubLabel } from './shared';

const NUTRITION_TYPES = ['Veg', 'Flora', 'PK Boost', 'Micro', 'Cal-Mag', 'Enzimas', 'Outro'];

interface Props {
  product: string;
  onProductChange: (v: string) => void;
  dose: string;
  onDoseChange: (v: string) => void;
  ph: string;
  onPhChange: (v: string) => void;
  ec: string;
  onEcChange: (v: string) => void;
  type: string;
  onTypeChange: (v: string) => void;
  theme: any;
}

export const NutritionForm: React.FC<Props> = ({
  product, onProductChange,
  dose, onDoseChange,
  ph, onPhChange,
  ec, onEcChange,
  type, onTypeChange,
  theme,
}) => (
  <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
    <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>Detalhes da nutrição</Text>
    <FieldInput label="Produto *" value={product} onChange={onProductChange} placeholder="Ex: BioGrow, Cal-Mag..." theme={theme} />
    <NumberInput label="Dose (ml/L) *" value={dose} onChange={onDoseChange} placeholder="2" decimal theme={theme} />
    <NumberInput label="pH da solução" value={ph} onChange={onPhChange} placeholder="6.0" decimal theme={theme} />
    <NumberInput label="EC (mS/cm)" value={ec} onChange={onEcChange} placeholder="1.2" decimal theme={theme} />
    <SubLabel text="Tipo:" theme={theme} />
    <OptionButtons options={NUTRITION_TYPES} selected={type} onSelect={onTypeChange} theme={theme} />
  </View>
);

const styles = StyleSheet.create({
  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
});
