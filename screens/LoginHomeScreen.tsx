import { TouchableOpacity, StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import React, { memo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import Paragraph from '../components/Paragraph';
import { Navigation } from '../types';
import { theme } from '../core/theme';

type Props = {
  navigation: Navigation;
};

const HomeScreen = ({ navigation }: Props) => {
  const checkUserLoggedIn = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData != null) {
      navigation.navigate('Main');
    }
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  return (
    <Background>
      <Logo />

      <Paragraph>
        Register yourself and get started with helping Earth through Karbon!
      </Paragraph>
      <Button mode="contained" onPress={() => navigation.navigate('LoginScreen')}>
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        Sign Up
      </Button>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by</Text>
        <Image source={require('../assets/icons/logo-white.png')} style={styles.footerImage} />
      </View>
    </Background>
  );
};


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  footerText: {
    marginRight: 10,
    fontSize: 16,
    color: 'white',
    fontFamily: 'Montserrat-Light',

  },
  footerImage: {
    width: 50,
    height: 50,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    color: 'white',
    fontFamily: 'Montserrat-Light'
  },
  link: {
    fontFamily: 'Montserrat-Light',
    color: 'red',
  },
});
export default memo(HomeScreen);