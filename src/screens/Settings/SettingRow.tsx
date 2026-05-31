import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { settingsOptions, styles } from './constants';

interface SettingToggleProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  theme: any;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  title, description, value, onToggle, theme,
}) => (
  <View style={[
    styles.settingRow,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
  ]}>
    <View style={styles.settingInfo}>
      <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
        {description}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
      thumbColor={theme.colors.onPrimary}
    />
  </View>
);

interface SettingSelectProps {
  title: string;
  description: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onSelect: (v: string) => void;
  theme: any;
}

export const SettingSelect: React.FC<SettingSelectProps> = ({
  title, description, options, value, onSelect, theme,
}) => (
  <View style={[
    styles.settingRow,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
  ]}>
    <View style={styles.settingInfo}>
      <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
        {description}
      </Text>
      <View style={styles.selectContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.selectOption,
              {
                backgroundColor: value === opt.value
                  ? theme.colors.primaryContainer
                  : theme.colors.elevation.level1,
                borderColor: value === opt.value
                  ? theme.colors.primary
                  : theme.colors.outlineVariant,
              },
            ]}
            onPress={() => onSelect(opt.value)}
          >
            <Text
              style={[
                styles.selectOptionText,
                { color: theme.colors.onSurface },
                value === opt.value && { color: theme.colors.primary, fontWeight: '700' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);
