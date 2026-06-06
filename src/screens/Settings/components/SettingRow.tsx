import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

interface SettingRowProps {
  label: string;
  value: string;
  onPress: () => void;
  badge?: string;
  theme: any;
  disabled?: boolean;
  loading?: boolean;
  rightElement?: React.ReactNode;
}

/**
 * Linha de configuração padrão com label, value e ação de navegação.
 * Suporta badge (ex: "Sistema"), loading state, elemento customizado à direita ou chevron padrão.
 */
export const SettingRow: React.FC<SettingRowProps> = ({
  label,
  value,
  onPress,
  badge,
  theme,
  disabled,
  loading,
  rightElement,
}) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <View style={styles.settingInfo}>
      <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>{label}</Text>
      <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>{value}</Text>
    </View>
    {rightElement ? (
      <View style={styles.settingRightElement}>{rightElement}</View>
    ) : badge ? (
      <View style={[styles.autoBadge, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.autoBadgeText, { color: theme.colors.onPrimaryContainer }]}>{badge}</Text>
      </View>
    ) : loading ? (
      <Ionicons name="refresh" size={20} color={theme.colors.primary} />
    ) : (
      <Text style={[styles.chevron, { color: theme.colors.outline }]}>›</Text>
    )}
  </TouchableOpacity>
);