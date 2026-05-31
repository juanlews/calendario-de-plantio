import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const geneticsColor = (g: string) => {
  switch (g) {
    case 'indica': return '#7B1FA2';
    case 'sativa': return '#1565C0';
    default: return '#2E7D32';
  }
};

export const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loader: { marginVertical: 20 },

  header: { padding: 16, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strainName: { fontSize: 22, fontWeight: '800', flex: 1 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 18 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' },
  editStageBtn: { padding: 4, marginLeft: 4 },
  editStageBtnText: { fontSize: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  badgeStage: { borderWidth: 1 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  infoBlock: { width: '30%', alignItems: 'center', marginBottom: 8 },
  infoValue: { fontSize: 15, fontWeight: '700' },
  infoLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },

  notesCard: { padding: 16, marginTop: 1 },
  notesLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  notesText: { fontSize: 14, lineHeight: 20 },

  actionsSection: { padding: 16, marginTop: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    flex: 1, minWidth: 90, padding: 12, borderRadius: 10,
    borderWidth: 1, alignItems: 'center',
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '600' },

  timelineSection: { padding: 16 },
  emptyTimeline: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: '600' },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 4, maxWidth: 260 },

  entryWrapper: { flexDirection: 'row', marginBottom: 2 },
  timelineLine: { width: 28, alignItems: 'center', paddingTop: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineBar: { flex: 1, width: 2, marginTop: 2 },
  entryCard: {
    flex: 1, borderRadius: 10, padding: 12,
    marginLeft: 4, marginBottom: 10, borderWidth: 1,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entryHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  entryIcon: { fontSize: 16, marginRight: 6 },
  entryType: { fontSize: 13, fontWeight: '700' },
  entryHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryTime: { fontSize: 12 },
  entryDelBtn: { padding: 4 },
  entryDelText: { fontSize: 14, fontWeight: '700' },
  entryData: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  dataItem: { borderRadius: 6, padding: 6, paddingHorizontal: 10 },
  dataLabel: { fontSize: 10, fontWeight: '500' },
  dataValue: { fontSize: 13, fontWeight: '600' },
  entryImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  entryVideoPlaceholder: {
    width: '100%', height: 100, borderRadius: 8, marginBottom: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  entryVideoIcon: { fontSize: 32 },
  entryVideoText: { fontSize: 13, marginTop: 4 },
  entryNote: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  entryDate: { fontSize: 11, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 16 },
  modalStageItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderWidth: 1, borderColor: 'transparent' },
  modalStageIcon: { fontSize: 22, marginRight: 12 },
  modalStageLabel: { fontSize: 16, flex: 1 },
  modalStageCheck: { fontSize: 18, fontWeight: '700' },
});
