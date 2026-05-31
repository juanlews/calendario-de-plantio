import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  list: { padding: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  card: {
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardMuted: { opacity: 0.7 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  typeBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6,
  },
  typeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  name: { fontSize: 18, fontWeight: '700' },
  delBtn: { padding: 4 },
  delBtnText: { fontSize: 20 },
  stageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  stageBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  stageIcon: { fontSize: 14, marginRight: 4 },
  stageText: { fontSize: 13, fontWeight: '700' },
  qty: { marginLeft: 'auto', fontSize: 12 },
  infoGrid: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 10,
  },
  infoBlock: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  datesRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dateCol: { flex: 1 },
  dateLabel: { fontSize: 11 },
  dateValue: { fontSize: 13, fontWeight: '500' },
  advanceBtn: { padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  advanceFlower: { backgroundColor: '#E91E63' },
  advanceHarvest: { backgroundColor: '#FF9800' },
  advanceText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  notes: { fontSize: 12, fontStyle: 'italic', marginTop: 6 },
});

export const geneticsColor = (g: string) => {
  switch (g) {
    case 'indica': return '#7B1FA2';
    case 'sativa': return '#1565C0';
    case 'hybrid': return '#2E7D32';
    default: return '#2E7D32';
  }
};
