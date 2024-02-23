import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 

function Step1({ navigation }) {
    React.useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        navigation.setOptions({ tabBarVisible: false, headerShown: false });
      });
  
      return unsubscribe;
    }, [navigation]);

  return (
    <View style={styles.container}>
        <View style={styles.backButtonContainer}>
        <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
        >
            <Icon name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.backButtonText}>What is Carbon Footprint?</Text>
        </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Carbon Footprint</Text>
        <Text style={styles.text}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget metus ac elit
          suscipit bibendum nec quis velit.
        </Text>
      </View>
      <Image
        style={styles.image}
        source={{ uri: 'https://pbs.twimg.com/media/FMNN_P7VUAQyriv.jpg:large' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  backButton: {
    marginBottom: 20,
  },
  textContainer: {
    marginTop: 60, 
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
  },
  backButtonText: {
    fontSize: 18,
    marginLeft: 15,
    marginBottom: 20,
  },
  backButtonContainer: {
    margin: 15,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Step1;