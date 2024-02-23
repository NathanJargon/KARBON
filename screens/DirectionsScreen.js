import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DirectionsScreen = () => {
  const navigation = useNavigation();

  const handleMarkerPress = () => {
    // Navigate to MarkerInteraction screen
    navigation.navigate('MarkerInteraction');
  };

  const handleGetDirections = () => {
    // Navigate to Directions screen
    navigation.navigate('Directions');
  };

  return (
    <View>
      <Text>Real Time Screen</Text>
      <Button title="Marker Interaction" onPress={handleMarkerPress} />
      <Button title="Get Directions" onPress={handleGetDirections} />
    </View>
  );
};

export default DirectionsScreen;
