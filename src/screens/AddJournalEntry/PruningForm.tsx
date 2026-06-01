import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FieldInput, OptionButtons, SubLabel } from './shared';

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
}) => {
  const { t } = useTranslation();
  const pruningMethods = [
    t('journal.typeTopping'),
    t('journal.typeFIM'),
    t('journal.typeLST'),
    t('journal.typeDefoliation'),
    t('journal.typeLollipop'),
    t('journal.typeScrOG'),
    t('journal.typeSuperCropping'),
    t('journal.typeTopping'),
  ];

  return (
    <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>{t('journal.pruning')}</Text>
      <SubLabel text={t('journal.pruningType') + ' *:'} theme={theme} />
      <OptionButtons options={pruningMethods} selected={method} onSelect={onMethodChange} theme={theme} />
      <FieldInput
        label={t('plantDetail.notes')}
        value={details}
        onChange={onDetailsChange}
        placeholder={t('journal.pruningLocationPlaceholder')}
        multiline
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: { padding: 16, marginTop: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
});
