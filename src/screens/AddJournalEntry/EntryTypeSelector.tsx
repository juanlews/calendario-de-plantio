import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { JournalEntryType } from '../../types/planting';

const ENTRY_TYPES: { type: JournalEntryType; icon: string; i18nKeyLabel: string; i18nKeyDesc: string; color: string }[] = [
  { type: 'photo', icon: '📷', i18nKeyLabel: 'journal.photo', i18nKeyDesc: 'journal.photoLibrary', color: '#7B1FA2' },
  { type: 'video', icon: '🎥', i18nKeyLabel: 'journal.video', i18nKeyDesc: 'journal.videoLibrary', color: '#C2185B' },
  { type: 'watering', icon: '💧', i18nKeyLabel: 'journal.watering', i18nKeyDesc: 'journal.waterMethod', color: '#0288D1' },
  { type: 'nutrition', icon: '🧪', i18nKeyLabel: 'journal.nutrition', i18nKeyDesc: 'journal.nutrientBrand', color: '#2E7D32' },
  { type: 'pruning', icon: '✂️', i18nKeyLabel: 'journal.pruning', i18nKeyDesc: 'journal.pruningType', color: '#E65100' },
  { type: 'comment', icon: '💬', i18nKeyLabel: 'journal.comment', i18nKeyDesc: 'journal.noteLabel', color: '#1565C0' },
];

interface Props {
  onSelect: (type: JournalEntryType) => void;
  theme: any;
}

export const EntryTypeSelector: React.FC<Props> = ({ onSelect, theme }) => {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{t('journal.selectEntryType')}</Text>
      <View style={styles.typeGrid}>
        {ENTRY_TYPES.map((item) => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.typeCard,
              { borderColor: item.color + '33', backgroundColor: theme.colors.surface },
            ]}
            onPress={() => onSelect(item.type)}
          >
            <Text style={styles.typeIcon}>{item.icon}</Text>
            <Text style={[styles.typeLabel, { color: item.color }]}>{t(item.i18nKeyLabel)}</Text>
            <Text style={[styles.typeDesc, { color: theme.colors.onSurfaceVariant }]}>{t(item.i18nKeyDesc)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const ENTRY_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {};
ENTRY_TYPES.forEach((t) => { ENTRY_TYPE_CONFIG[t.type] = { icon: t.icon, label: t.i18nKeyLabel, color: t.color }; });

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', padding: 16, textAlign: 'center' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10, justifyContent: 'center' },
  typeCard: {
    width: '45%', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center',
  },
  typeIcon: { fontSize: 32, marginBottom: 6 },
  typeLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  typeDesc: { fontSize: 11, textAlign: 'center' },
});
