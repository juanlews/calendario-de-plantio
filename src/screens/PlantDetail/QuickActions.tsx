import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { JournalEntryType } from '../../types/planting';
import { styles } from './shared';

const QUICK_ACTIONS: JournalEntryType[] = ['photo', 'video', 'watering', 'nutrition', 'pruning', 'comment'];

const ENTRY_TYPE_CONFIG: Record<JournalEntryType, { icon: string; i18nKey: string; color: string }> = {
  photo: { icon: '📷', i18nKey: 'journal.photo', color: '#7B1FA2' },
  video: { icon: '🎥', i18nKey: 'journal.video', color: '#C2185B' },
  comment: { icon: '💬', i18nKey: 'journal.comment', color: '#1565C0' },
  watering: { icon: '💧', i18nKey: 'journal.watering', color: '#0288D1' },
  nutrition: { icon: '🧪', i18nKey: 'journal.nutrition', color: '#2E7D32' },
  pruning: { icon: '✂️', i18nKey: 'journal.pruning', color: '#E65100' },
  stage_change: { icon: '🔄', i18nKey: 'journal.stageChange', color: '#FF9800' },
};

interface Props {
  plantingId: string;
  onNavigate: (type: JournalEntryType) => void;
  theme: any;
}

export const QuickActions: React.FC<Props> = ({ plantingId, onNavigate, theme }) => {
  const { t } = useTranslation();

  return (
    <View style={[styles.actionsSection, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>⚡ {t('journal.addEntryTitle')}</Text>
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
              {t(ENTRY_TYPE_CONFIG[type].i18nKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
