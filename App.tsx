import React from 'react';
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

          if (route.name === 'Calendário') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Plantios') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Configurações') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Calendário" component={CalendarScreen} />
      <Tab.Screen name="Plantios" component={PlantingsStack} />
      <Tab.Screen name="Adicionar" component={AddPlantingScreen} />
      <Tab.Screen name="Configurações" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
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
  );
}
