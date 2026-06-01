import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FieldInput, NumberInput, OptionButtons, SubLabel } from './shared';

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
}) => {
  const { t } = useTranslation();
  const nutritionTypes = ['Veg', 'Flora', 'PK Boost', 'Micro', 'Cal-Mag', 'Enzimas', 'Outro'];

  return (
    <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>{t('journal.nutrition')}</Text>
      <FieldInput
        label={`${t('journal.nutrientBrand')} *`}
        value={product}
        onChange={onProductChange}
        placeholder={t('journal.nutrientBrandPlaceholder').replace('e.g. ', '').replace('Ex: ', '')}
        theme={theme}
      />
      <NumberInput
        label={`${t('journal.nutrientDose')} *`}
        value={dose}
        onChange={onDoseChange}
        placeholder={t('journal.nutrientDosePlaceholder').replace('e.g. ', '').replace('Ex: ', '')}
        decimal
        theme={theme}
      />
      <NumberInput label="pH da solução" value={ph} onChange={onPhChange} placeholder="6.0" decimal theme={theme} />
      <NumberInput label="EC (mS/cm)" value={ec} onChange={onEcChange} placeholder="1.2" decimal theme={theme} />
      <SubLabel text={t('addPlanting.previewTo') + ':'} theme={theme} />
      <OptionButtons options={nutritionTypes} selected={type} onSelect={onTypeChange} theme={theme} />
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
});
