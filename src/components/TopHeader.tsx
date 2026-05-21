/**
 * TopHeader — barra de topo reutilizável para todas as telas.
 *
 * Usa o tema ativo (light / dark / Material You) via react-native-paper.
 * A cor de fundo segue `theme.colors.primary` e o texto usa `theme.colors.onPrimary`.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export type TopHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void };
};

const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const theme = useTheme();
  const isDark = theme.dark;

  // Ajusta status bar conforme o tema
  const statusBarStyle = isDark ? 'light-content' : 'light-content'; // header é sempre primary (escuro)

  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.colors.primary} />
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.row}>
          {showBack && (
            <TouchableOpacity
              onPress={onBack ?? (() => {})}
              style={styles.backBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.textWrap}>
            <Text
              style={[styles.title, { color: theme.colors.onPrimary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[styles.subtitle, { color: theme.colors.onPrimary + 'BB' }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {rightAction && (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={styles.rightBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={rightAction.icon} size={22} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ?? 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  rightBtn: {
    padding: 4,
    marginLeft: 8,
  },
});

export default TopHeader;
