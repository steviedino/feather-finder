import React, { useState } from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import SightingsScreen from './screens/SightingsScreen';
import BirdDetailsScreen from './screens/BirdDetailsScreen';
// MapScreen removed for compatibility

const Stack = createNativeStackNavigator();

export default function App() {
  const [sightings, setSightings] = useState([]);

  const addSighting = (newSighting) => {
    setSightings((prev) => [newSighting, ...prev]);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitle: () => (
            <Image
              source={require('./assets/logo.png')}
              style={{ width: 40, height: 40, resizeMode: 'contain' }}
            />
          ),
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#f0f9ff' },
        }}
      >
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
        >
          {(props) => (
            <HomeScreen {...props} addSighting={addSighting} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Sightings">
          {(props) => (
            <SightingsScreen {...props} sightings={sightings} />
          )}
        </Stack.Screen>

        <Stack.Screen name="BirdDetails" component={BirdDetailsScreen} />
        {/* Map screen removed for clean iOS build */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
