import React from 'react';
import { View } from 'react-native';
import { styles } from '../styles';

interface DividerProps {
  theme: any;
}

/** Divisor visual entre itens dentro de uma seção. */
export const Divider: React.FC<DividerProps> = ({ theme }) => (
  <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
);