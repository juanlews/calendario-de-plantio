import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

interface SectionGroupProps {
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  theme: any;
}

/**
 * Agrupa configurações relacionadas com título e container visual.
 * Usado para separar visualmente seções como "Aparência", "Segurança", etc.
 */
export const SectionGroup: React.FC<SectionGroupProps> = ({
  title,
  children,
  disabled,
  theme,
}) => (
  <>
    <Text style={[styles.groupTitle, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
    <View style={[styles.group, { backgroundColor: theme.colors.surface, opacity: disabled ? 0.5 : 1 }]}>
      {children}
    </View>
  </>
);