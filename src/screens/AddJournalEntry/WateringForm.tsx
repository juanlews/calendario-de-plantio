import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberInput, OptionButtons, SubLabel } from './shared';

interface Props {
  volume: string;
  onVolumeChange: (v: string) => void;
  ph: string;
  onPhChange: (v: string) => void;
  method: string;
  onMethodChange: (v: string) => void;
  runoff: boolean;
  onRunoffChange: (v: boolean) => void;
  theme: any;
}

export const WateringForm: React.FC<Props> = ({
  volume, onVolumeChange,
  ph, onPhChange,
  method, onMethodChange,
  runoff, onRunoffChange,
  theme,
}) => {
  const { t } = useTranslation();
  const methodKeys = [
    'journal.methodTopWatering',
    'journal.methodDrip',
    'journal.methodBottomWatering',
    'journal.methodFoliar',
  ] as const;

  return (
    <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>{t('journal.watering')}</Text>
      <NumberInput label={t('journal.waterAmount')} value={volume} onChange={onVolumeChange} placeholder={t('journal.waterAmountPlaceholder').replace('e.g. ', '').replace('Ex: ', '')} theme={theme} />
      <NumberInput label={t('journal.phLabel')} value={ph} onChange={onPhChange} placeholder="6.5" decimal theme={theme} />
      <SubLabel text={t('journal.waterMethod') + ':'} theme={theme} />
      <OptionButtons
        options={methodKeys.map((k) => t(k))}
        selected={method}
        onSelect={onMethodChange}
        theme={theme}
      />
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: theme.colors.outlineVariant },
          runoff && { backgroundColor: theme.colors.primaryContainer },
        ]}
        onPress={() => onRunoffChange(!runoff)}
      >
        <Text style={[styles.checkboxText, { color: theme.colors.onSurface }]}>
          {runoff ? '☑️' : '⬜'} {t('journal.runoff')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  checkbox: {
    padding: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1,
  },
  checkboxText: { fontSize: 14 },
});
