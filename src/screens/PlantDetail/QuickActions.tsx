import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { JournalEntryType } from '../../types/planting';
import { styles } from './shared';

const QUICK_ACTIONS: JournalEntryType[] = ['photo', 'video', 'watering', 'nutrition', 'pruning', 'comment'];

const ENTRY_TYPE_CONFIG: Record<JournalEntryType, { icon: string; label: string; color: string }> = {
  photo: { icon: '📷', label: 'Foto', color: '#7B1FA2' },
  video: { icon: '🎥', label: 'Vídeo', color: '#C2185B' },
  comment: { icon: '💬', label: 'Comentário', color: '#1565C0' },
  watering: { icon: '💧', label: 'Rega', color: '#0288D1' },
  nutrition: { icon: '🧪', label: 'Nutrição', color: '#2E7D32' },
  pruning: { icon: '✂️', label: 'Poda', color: '#E65100' },
};

interface Props {
  plantingId: string;
  onNavigate: (type: JournalEntryType) => void;
  theme: any;
}

export const QuickActions: React.FC<Props> = ({ plantingId, onNavigate, theme }) => (
  <View style={[styles.actionsSection, { backgroundColor: theme.colors.surface }]}>
    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>⚡ Registrar</Text>
    <View style={styles.actionsGrid}>
      {QUICK_ACTIONS.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.actionBtn,
            {
              borderColor: ENTRY_TYPE_CONFIG[type].color + '44',
              backgroundColor: theme.colors.elevation.level1,
            },
          ]}
          onPress={() => onNavigate(type)}
        >
          <Text style={styles.actionIcon}>{ENTRY_TYPE_CONFIG[type].icon}</Text>
          <Text style={[styles.actionLabel, { color: ENTRY_TYPE_CONFIG[type].color }]}>
            {ENTRY_TYPE_CONFIG[type].label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
