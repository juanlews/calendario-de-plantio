import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { styles } from '../styles';

interface SelectionModalProps {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  cancelLabel: string;
  theme: any;
  /** Ação de confirmação opcional - renderiza botão de confirmar ao lado do cancelar */
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  /** Se true, botão de confirmar usa cor de erro (destrutivo) */
  confirmDestructive?: boolean;
  /** Conteúdo customizado no rodapé (substitui botões padrão) */
  footer?: React.ReactNode;
}

/**
 * Modal padrão para seleção de opções (tema, idioma, formatos) ou confirmação.
 * Suporta footer com botões Cancelar/Confirmar estilo MD3 ou footer customizado.
 */
export const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  title,
  children,
  onCancel,
  cancelLabel,
  theme,
  onConfirm,
  confirmLabel,
  confirmDisabled,
  confirmDestructive,
  footer,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        {children}
        {footer ? (
          footer
        ) : (
          <View style={[styles.modalFooter, { borderTopColor: theme.colors.outlineVariant }]}>
            <TouchableOpacity
              style={[
                styles.modalFooterButton,
                { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface },
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.modalFooterButtonText, { color: theme.colors.error }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            {onConfirm && (
              <TouchableOpacity
                style={[styles.modalFooterButton, { backgroundColor: confirmDestructive ? theme.colors.error : theme.colors.primary }]}
                onPress={onConfirm}
                disabled={confirmDisabled}
              >
                <Text style={[styles.modalFooterButtonText, { color: theme.colors.onPrimary }]}>{confirmLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  </Modal>
);