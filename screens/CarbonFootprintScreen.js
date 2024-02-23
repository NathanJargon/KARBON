import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Switch, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function CarbonFootprintScreen() {
  const [litersValue, setLitersValue] = useState('');
  const [kilometersValue, setKilometersValue] = useState('');
  const [animation, setAnimation] = useState(new Animated.Value(0));

  const allInputsFilled = litersValue !== '' && kilometersValue !== '';
  const startAnimation = () => {
    const totalCarbonFootprint = calculateCarbonFootprint();
  
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };
  
  const calculateCarbonFootprint = () => {
    const gallons = parseFloat(litersValue) * 0.264172;
    const miles = parseFloat(kilometersValue) * 0.62137;
  
    const milesPerGallon = miles / gallons;
  
    const totalCarbonFootprint = ((8.89 * Math.pow(10, -3)) / gallons) * (1 / 22.9) * (1 / 0.993);
  
    return totalCarbonFootprint.toFixed(3);
  };

  return (
    <ImageBackground source={require('../assets/assessbg.png')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.row}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gallon</Text>
        <TextInput
          style={styles.input}
          value={litersValue}
          onChangeText={setLitersValue}
          placeholder="Liters"
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Miles</Text>
        <TextInput
          style={styles.input}
          value={kilometersValue}
          onChangeText={setKilometersValue}
          placeholder="Kilometers"
          keyboardType="numeric"
        />
      </View>
    </View>
      <TouchableOpacity
        style={[styles.button, allInputsFilled && styles.buttonGlow]}
        onPress={startAnimation}
        disabled={!allInputsFilled}
      >
        <Text style={styles.buttonText}>Calculate Carbon Footprint</Text>
      </TouchableOpacity>

      <Animated.View style={{ opacity: animation }}>
      <Text style={{ fontSize: 20 }}>
        Your total carbon footprint is:
      </Text>
      <Text style={{ fontSize: 20}}>{calculateCarbonFootprint()}</Text>
      <Text style={{ fontSize: 20 }}>
        metric tons CO
        <Text style={{ fontSize: 10, bottom: -2 }}>2</Text>
        E/mile
      </Text>
      </Animated.View>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '10%',
    marginTop: -200,
  },
  inputContainer: {
    width: '40%',
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#4caf50',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#74D178',
    marginTop: 20,
    borderRadius: 10,
  },
  buttonGlow: {
    backgroundColor: 'green',
    shadowColor: '#00ff00',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
  },
});

export default CarbonFootprintScreen;