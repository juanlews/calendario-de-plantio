import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { PlantProvider } from './src/context/PlantContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { CalendarScreen } from './src/screens/Calendar';
import { PlantingsScreen } from './src/screens/Plantings';
import { AddPlantingScreen } from './src/screens/AddPlanting';
import { PlantDetailScreen } from './src/screens/PlantDetail';
import type { PlantDetailParamList } from './src/screens/PlantDetail';
import { AddJournalEntryScreen } from './src/screens/AddJournalEntry';
import { SettingsScreen } from './src/screens/Settings';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();
const PlantStack = createNativeStackNavigator<PlantDetailParamList>();

/**
 * Stack para Plantios — todos os headers são desabilitados;
 * cada tela usa <TopHeader> internamente.
 */
function PlantingsStack() {
  return (
    <PlantStack.Navigator screenOptions={{ headerShown: false }}>
      <PlantStack.Screen name="PlantingsList" component={PlantingsScreen} />
      <PlantStack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <PlantStack.Screen name="AddJournalEntry" component={AddJournalEntryScreen} />
    </PlantStack.Navigator>
  );
}

function TabNavigator() {
  const theme = useTheme();
  const isDark = theme.dark;
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDark ? theme.colors.onSurfaceVariant : '#888',
        tabBarStyle: {
          backgroundColor: isDark ? theme.colors.surface : '#fff',
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'calendario_tab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'plantios_tab') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'configuracoes_tab') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="calendario_tab" component={CalendarScreen} options={{ tabBarLabel: t('nav.calendar') }} />
      <Tab.Screen name="plantios_tab" component={PlantingsStack} options={{ tabBarLabel: t('nav.plantings') }} />
      <Tab.Screen name="adicionar_tab" component={AddPlantingScreen} options={{ tabBarLabel: t('nav.addPlanting') }} />
      <Tab.Screen name="configuracoes_tab" component={SettingsScreen} options={{ tabBarLabel: t('nav.settings') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <PlantProvider>
              <NavigationContainer>
                <TabNavigator />
              </NavigationContainer>
            </PlantProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
