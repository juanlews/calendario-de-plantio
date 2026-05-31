import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FieldInput, OptionButtons, SubLabel } from './shared';

const PRUNING_METHODS = ['Topping', 'Fimming', 'LST', 'HST', 'Defoliação', 'Lollipop', 'Super Cropping', 'ScrOG', 'Outra'];

interface Props {
  method: string;
  onMethodChange: (v: string) => void;
  details: string;
  onDetailsChange: (v: string) => void;
  theme: any;
}

export const PruningForm: React.FC<Props> = ({
  method, onMethodChange,
  details, onDetailsChange,
  theme,
}) => (
  <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
    <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>Detalhes da poda</Text>
    <SubLabel text="Método *:" theme={theme} />
    <OptionButtons options={PRUNING_METHODS} selected={method} onSelect={onMethodChange} theme={theme} />
    <FieldInput
      label="Detalhes"
      value={details}
      onChange={onDetailsChange}
      placeholder="Ex: removi 30% das folhas baixas..."
      multiline
      theme={theme}
    />
  </View>
);

const styles = StyleSheet.create({
  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
});
