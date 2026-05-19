import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlantProvider } from './src/context/PlantContext';
import CalendarScreen from './src/screens/CalendarScreen';
import PlantingsScreen from './src/screens/PlantingsScreen';
import AddPlantingScreen from './src/screens/AddPlantingScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
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
                } else {
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Calendário" component={CalendarScreen} />
            <Tab.Screen name="Plantios" component={PlantingsScreen} />
            <Tab.Screen name="Adicionar" component={AddPlantingScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PlantProvider>
    </SafeAreaProvider>
  );
}
