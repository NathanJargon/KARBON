import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { Navigation } from '../types';
import {
  emailValidator,
  passwordValidator,
  nameValidator,
} from '../core/utils';
import { auth } from '../screens/FirebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; 
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../screens/FirebaseConfig';
import { Alert } from 'react-native';
import moment from 'moment';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from './FirebaseConfig';

type Props = {
  navigation: Navigation;
};

const RegisterScreen = ({ navigation }: Props) => {
  const [name, setName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });

  const _onSignUpPressed = () => {
    const nameError = nameValidator(name.value);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (name.value.length < 5 || name.value.length > 8) {
      Alert.alert('Invalid Username', 'Username must be 5-8 characters long.');
      setName({ ...name, error: 'Username must be 5-8 characters long.' });
      return;
    }
  
    if (emailError || passwordError || nameError) {
      setName({ ...name, error: nameError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }
  
      createUserWithEmailAndPassword(auth, email.value, password.value)
      .then(async (userCredential) => {
        // Registration successful, save additional user information in Firestore
        const user = userCredential.user;
        setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: name.value,
          email: email.value,
          password: password.value,
          bio: '',
          phone: '',
          profile: '',
          emissionlogs: [{}],
          lastPressedDate: moment().format('YYYY-MM-DD'),
        });

        // Get the user's ID token
        const idToken = await user.getIdToken();

        const functions = getFunctions(firebaseApp, 'asia-southeast1');
        const sendWelcomeEmail = httpsCallable(functions, 'sendWelcomeEmail');

        // Pass the ID token to the Cloud Function
        sendWelcomeEmail({ email: email.value })
          .then((result) => {
            console.log(result); // Handle result
          })
          .catch((error) => {
            console.error(error); // Handle error
          });

        navigation.navigate('Main');
      })
      .catch((error) => {
        // Registration failed, update state to show error message
        setName({ ...name, error: error.message });
        setEmail({ ...email, error: error.message });
        setPassword({ ...password, error: error.message });
      });
  };

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('HomeScreen')} />

      <Logo />

      <Header>Create Account</Header>

      <TextInput
        label="Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={text => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
        placeholder="Minimum 5-8 characters"
      />

      <TextInput
        label="Valid email address"
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
        label="Minimum 6 characters"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <Button mode="contained" onPress={_onSignUpPressed} style={styles.button}>
        Sign Up
      </Button>

      <View style={styles.row}>
        <Text style={styles.label}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  label: {
    color: 'white',
    fontFamily: 'Montserrat-Light'
  },
  button: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    color: 'red',
    fontFamily: 'Montserrat-Light'
  },
});

export default memo(RegisterScreen);
