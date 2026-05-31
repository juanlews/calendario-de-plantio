import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type JournalEntryType = 'photo' | 'video' | 'watering' | 'nutrition' | 'pruning' | 'comment';

const ENTRY_TYPES: { type: JournalEntryType; icon: string; label: string; color: string; desc: string }[] = [
  { type: 'photo', icon: '📷', label: 'Foto', color: '#7B1FA2', desc: 'Tirar foto ou selecionar da galeria' },
  { type: 'video', icon: '🎥', label: 'Vídeo', color: '#C2185B', desc: 'Gravar ou selecionar vídeo' },
  { type: 'watering', icon: '💧', label: 'Rega', color: '#0288D1', desc: 'Registrar irrigação' },
  { type: 'nutrition', icon: '🧪', label: 'Nutrição', color: '#2E7D32', desc: 'Aplicação de fertilizante/nutriente' },
  { type: 'pruning', icon: '✂️', label: 'Poda', color: '#E65100', desc: 'Registrar poda/treinamento' },
  { type: 'comment', icon: '💬', label: 'Comentário', color: '#1565C0', desc: 'Nota ou observação livre' },
];

interface Props {
  onSelect: (type: JournalEntryType) => void;
  theme: any;
}

export const EntryTypeSelector: React.FC<Props> = ({ onSelect, theme }) => (
  <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <Text style={[styles.title, { color: theme.colors.onSurface }]}>Que tipo de registro?</Text>
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
          <Text style={[styles.typeLabel, { color: item.color }]}>{item.label}</Text>
          <Text style={[styles.typeDesc, { color: theme.colors.onSurfaceVariant }]}>{item.desc}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const ENTRY_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string; desc: string }> = {};
ENTRY_TYPES.forEach((t) => { ENTRY_TYPE_CONFIG[t.type] = t; });

export type { JournalEntryType };

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
