import React, { memo, useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { emailValidator, passwordValidator } from '../core/utils';
import { Navigation } from '../types';
import { auth } from '../screens/FirebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { firebaseApp } from './FirebaseConfig';

type Props = {
  navigation: Navigation;
};

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });

  const checkUserLoggedIn = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData != null) {
        navigation.navigate('Main');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    checkUserLoggedIn();
  }, []);


  const _onLoginPressed = () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }
  
    signInWithEmailAndPassword(auth, email.value, password.value)
    .then(async (userCredential) => {

      // console.log(email.value);
      // Send email
      const functions = getFunctions(firebaseApp, 'asia-southeast1');
      const sendEmail = httpsCallable(functions, 'sendEmail');


      sendEmail({ email: email.value })
        .then((result) => {
          console.log(result); // Handle result
        })
        .catch((error) => {
          console.error(error); // Handle error
        });


      // Store user data and current time
      const userData = {
        user: userCredential.user,
        uid: userCredential.user.uid, // Save user's UID
        loginTime: new Date().getTime(),
      };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      navigation.navigate('Main');
    })
    .catch((error) => {
      setEmail({ ...email, error: error.message });
      setPassword({ ...password, error: error.message });
    });
  };


  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('HomeScreen')} />

      <Logo />

      <Header>Welcome back.</Header>

      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={text => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPasswordScreen')}
        >
          <Text style={styles.label}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      <Button mode="contained" onPress={_onLoginPressed}>
        Login
      </Button>

    </Background>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
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
    color: 'blue',
  },
});

export default memo(LoginScreen);
