import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FieldInput, NumberInput, OptionButtons, SubLabel } from './shared';

// Internal keys — not displayed, just used for selection logic
const NUTRITION_TYPES: { key: string; i18nKey: string }[] = [
  { key: 'veg', i18nKey: 'journal.nutritionTypeVeg' },
  { key: 'flower', i18nKey: 'journal.nutritionTypeFlower' },
  { key: 'pk_boost', i18nKey: 'journal.nutritionTypePK' },
  { key: 'micro', i18nKey: 'journal.nutritionTypeMicro' },
  { key: 'cal_mag', i18nKey: 'journal.nutritionTypeCalMag' },
  { key: 'enzymes', i18nKey: 'journal.nutritionTypeEnzymes' },
  { key: 'other', i18nKey: 'journal.nutritionTypeOther' },
];

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

  // Find matching entry — fallback: if stored value is a translated string (legacy), map back
  const currentType = NUTRITION_TYPES.find((nt) => nt.key === type)
    ?? NUTRITION_TYPES.find((nt) => t(nt.i18nKey) === type);

  const labels = NUTRITION_TYPES.map((nt) => t(nt.i18nKey));
  const selectedLabel = currentType ? t(currentType.i18nKey) : '';

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
      <NumberInput label={t('journal.solutionPh')} value={ph} onChange={onPhChange} placeholder="6.0" decimal theme={theme} />
      <NumberInput label={t('journal.ecMs')} value={ec} onChange={onEcChange} placeholder="1.2" decimal theme={theme} />
      <SubLabel text={t('journal.nutritionType') + ':'} theme={theme} />
      <OptionButtons
        options={labels}
        selected={selectedLabel}
        onSelect={(label) => {
          const found = NUTRITION_TYPES.find((nt) => t(nt.i18nKey) === label);
          if (found) onTypeChange(found.key);
        }}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
});
