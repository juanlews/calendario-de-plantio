import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlantProvider } from './src/context/PlantContext';
import { SettingsProvider } from './src/context/SettingsContext';
import CalendarScreen from './src/screens/CalendarScreen';
import PlantingsScreen from './src/screens/PlantingsScreen';
import AddPlantingScreen from './src/screens/AddPlantingScreen';
import PlantDetailScreen from './src/screens/PlantDetailScreen';
import AddJournalEntryScreen from './src/screens/AddJournalEntryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';

import type { PlantDetailParamList } from './src/screens/PlantDetailScreen';

const Tab = createBottomTabNavigator();
const PlantStack = createNativeStackNavigator<PlantDetailParamList>();

function PlantingsStack() {
  return (
    <PlantStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2e7d32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <PlantStack.Screen name="Lista" component={PlantingsScreen} options={{ title: 'Plantios' }} />
      <PlantStack.Screen name="PlantDetail" component={PlantDetailScreen} options={{ title: 'Detalhes' }} />
      <PlantStack.Screen name="AddJournalEntry" component={AddJournalEntryScreen} options={{ title: 'Novo Registro' }} />
    </PlantStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PlantProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerStyle: {
                  backgroundColor: '#2e7d32',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                tabBarActiveTintColor: '#2e7d32',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                  borderTopWidth: 1,
                  borderTopColor: '#e0e0e0',
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
              <Tab.Screen name="Calendário" component={CalendarScreen} options={{ headerShown: false }} />
              <Tab.Screen name="Plantios" component={PlantingsStack} options={{ headerShown: false }} />
              <Tab.Screen name="Adicionar" component={AddPlantingScreen} />
              <Tab.Screen name="Configurações" component={SettingsScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </PlantProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
