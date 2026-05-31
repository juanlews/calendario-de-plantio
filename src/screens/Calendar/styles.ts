import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loader: { marginVertical: 20 },
  details: { flex: 1, paddingHorizontal: 14, paddingTop: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  emptyText: { fontSize: 14, fontStyle: 'italic', padding: 8 },

  // Plant grouping card
  plantCard: { borderRadius: 10, marginBottom: 12, borderWidth: 1, overflow: 'hidden' },
  plantCardTitle: {
    fontSize: 15, fontWeight: '700', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)',
  },

  // Event rows
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 8 },
  eventIconWrap: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  eventIconText: { fontSize: 14 },
  eventInfo: { flex: 1 },
  eventRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  eventLabel: { fontSize: 13, fontWeight: '600' },
  eventTime: { fontSize: 11, fontWeight: '500', marginLeft: 8 },
  eventPlant: { fontSize: 12, fontWeight: '400' },
  eventDetail: { fontSize: 11, marginTop: 2 },

  // Upcoming events
  upcomingItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1,
  },
  upcomingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 10 },
  upcomingBadgeText: { fontSize: 9, fontWeight: '700' },
  upcomingName: { flex: 1, fontSize: 15 },
  upcomingDays: { fontSize: 13, fontWeight: '600' },
});
