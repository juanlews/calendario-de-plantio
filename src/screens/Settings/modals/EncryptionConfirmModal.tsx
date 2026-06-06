import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SelectionModal } from '../components';
import { styles } from '../styles';

interface EncryptionConfirmModalProps {
  visible: boolean;
  theme: any;
  onClose: () => void;
  onConfirm: () => void;
  pendingValue: boolean;
  busy: boolean;
}

/**
 * Modal de confirmação para ativar/desativar criptografia.
 * Exibe aviso apropriado para cada ação.
 */
export const EncryptionConfirmModal: React.FC<EncryptionConfirmModalProps> = ({
  visible,
  theme,
  onClose,
  onConfirm,
  pendingValue,
  busy,
}) => {
  const { t } = useTranslation();

  return (
    <SelectionModal
      visible={visible}
      title={pendingValue ? t('settings.encryptEnableTitle') : t('settings.encryptDisableTitle')}
      onCancel={onClose}
      cancelLabel={t('journal.cancelBtn')}
      onConfirm={onConfirm}
      confirmLabel={busy ? t('settings.encrypting') : (pendingValue ? t('settings.enable') : t('settings.disable'))}
      confirmDisabled={busy}
      confirmDestructive={!pendingValue}
      theme={theme}
    >
      <Text style={[styles.modalOptionDesc, { color: theme.colors.onSurface, marginBottom: 16, textAlign: 'center' }]}>
        {pendingValue ? t('settings.encryptEnableDesc') : t('settings.encryptDisableDesc')}
      </Text>
    </SelectionModal>
  );
};