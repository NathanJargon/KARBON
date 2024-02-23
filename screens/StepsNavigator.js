// StepsNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Step1 from './Step1';
import Step2 from './Step2';
// Import other step screens as needed

const Stack = createStackNavigator();

export default function StepsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Step1Screen" component={Step1} />
      <Stack.Screen name="Step2Screen" component={Step2} />
      {/* Add other step screens as needed */}
    </Stack.Navigator>
  );
}