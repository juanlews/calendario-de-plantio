import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  groupTitle: {
    fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16,
    textTransform: 'uppercase' as const, letterSpacing: 0.5,
  },
  group: { borderRadius: 12, overflow: 'hidden' as const },

  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingRowDisabled: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '500' },
  settingValue: { fontSize: 13, marginTop: 2 },
  autoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  autoBadgeText: { fontSize: 11, fontWeight: '600' },
  chevron: { fontSize: 22, marginLeft: 8 },
  comingSoon: { fontSize: 12, fontStyle: 'italic' as const },
  divider: { height: 1, marginLeft: 16 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, margin: 8, borderRadius: 8, gap: 8 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { borderRadius: 16, paddingBottom: 16, margin: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', padding: 16, textAlign: 'center' as const },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 8 },
  modalOptionIcon: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modalOptionTextWrap: { flex: 1 },
  modalOptionText: { fontSize: 16, fontWeight: '500' },
  modalOptionDesc: { fontSize: 12, marginTop: 2 },
  modalExample: { fontSize: 13, marginRight: 12 },
  checkmark: { fontSize: 18, fontWeight: '700' },
  modalCancel: { padding: 16, alignItems: 'center', borderTopWidth: 1, marginTop: 8 },
  modalCancelText: { fontSize: 16, fontWeight: '600' },
  modalDivider: { height: 1, marginVertical: 8, marginHorizontal: 16 },
});
