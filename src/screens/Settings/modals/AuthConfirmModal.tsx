import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SelectionModal } from '../components';
import { styles } from '../styles';

interface AuthConfirmModalProps {
  visible: boolean;
  theme: any;
  onClose: () => void;
  onConfirm: () => void;
  pendingValue: boolean;
  busy: boolean;
}

/**
 * Modal de confirmação para ativar/desativar autenticação biométrica/PIN.
 * Exibe aviso apropriado para cada ação.
 */
export const AuthConfirmModal: React.FC<AuthConfirmModalProps> = ({
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
      title={pendingValue ? t('settings.authEnableTitle') : t('settings.authDisableTitle')}
      onCancel={onClose}
      cancelLabel={t('journal.cancelBtn')}
      onConfirm={onConfirm}
      confirmLabel={busy ? t('settings.authenticating') : (pendingValue ? t('settings.enable') : t('settings.disable'))}
      confirmDisabled={busy}
      confirmDestructive={!pendingValue}
      theme={theme}
    >
      <Text style={[styles.modalOptionDesc, { color: theme.colors.onSurface, marginBottom: 16, textAlign: 'center' }]}>
        {pendingValue ? t('settings.authEnableDesc') : t('settings.authDisableDesc')}
      </Text>
    </SelectionModal>
  );
};