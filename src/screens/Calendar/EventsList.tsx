import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import type { PlantJournalEntry } from '../../types/planting';
import { ENTRY_CONFIG } from './constants';
import { styles } from './styles';

interface Props {
  events: Array<{ label: string; icon: string; color: string; detail?: string; time?: string }>;
  loading: boolean;
  theme: any;
}

export const EventsList: React.FC<Props> = ({ events, loading, theme }) => {
  if (loading) {
    return <ActivityIndicator style={styles.loader} size="small" color={theme.colors.primary} />;
  }

  if (events.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Nenhum evento nesta data
      </Text>
    );
  }

  return (
    <View>
      {events.map((evt, i) => (
        <View key={i} style={styles.eventRow}>
          <View style={[styles.eventIconWrap, { backgroundColor: evt.color + '18' }]}>
            <Text style={styles.eventIconText}>{evt.icon}</Text>
          </View>
          <View style={styles.eventInfo}>
            <View style={styles.eventRowTop}>
              <Text style={styles.eventLabel}>
                <Text style={{ color: evt.color }}>{evt.label}</Text>
              </Text>
              {evt.time && <Text style={styles.eventTime}>{evt.time}</Text>}
            </View>
            {evt.detail && <Text style={styles.eventDetail}>{evt.detail}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
};

export const UpcomingList: React.FC<{
  events: Array<{ plantName: string; label: string; icon: string; color: string; days: number }>;
  theme: any;
}> = ({ events, theme }) => {
  if (events.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Nenhum evento próximo
      </Text>
    );
  }

  return (
    <View>
      {events.map((evt, i) => (
        <View
          key={`${evt.plantName}-${evt.label}-${i}`}
          style={[styles.upcomingItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
        >
          <View style={[styles.upcomingBadge, { backgroundColor: evt.color + '18' }]}>
            <Text style={[styles.upcomingBadgeText, { color: evt.color }]}>
              {evt.icon} {evt.label.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.upcomingName, { color: theme.colors.onSurface }]}>{evt.plantName}</Text>
          <Text style={[styles.upcomingDays, { color: theme.colors.primary }]}>
            {evt.days === 0 ? 'Hoje!' : `${evt.days}d`}
          </Text>
        </View>
      ))}
    </View>
  );
};
