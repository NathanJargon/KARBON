import React, { memo, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { emailValidator } from '../core/utils';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import Logo from '../components/Logo';
import Header from '../components/Header';
import TextInput from '../components/TextInput';
import { theme } from '../core/theme';
import Button from '../components/Button';
import { Navigation } from '../types';
import { auth, db } from '../screens/FirebaseConfig';
import { getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

type Props = {
  navigation: Navigation;
};

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState({ value: '', error: '' });

  const _onSendPressed = async () => {
    const emailError = emailValidator(email.value);

    if (emailError) {
      Alert.alert('Error', emailError);
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email.value);
      navigation.navigate('LoginScreen');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('LoginScreen')} />

      <Logo />

      <Header>Restore Password</Header>

      <TextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={text => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <Button mode="contained" onPress={_onSendPressed} style={styles.button}>
        Send Reset Instructions
      </Button>

      <TouchableOpacity
        style={styles.back}
        onPress={() => navigation.navigate('LoginScreen')}
      >
        <Text style={styles.label}>← Back to login</Text>
      </TouchableOpacity>
    </Background>
  );
};

const styles = StyleSheet.create({
  back: {
    width: '100%',
    marginTop: 12,
  },
  button: {
    marginTop: 12,
  },
  label: {
    color: 'white',
    width: '100%',
    fontFamily: 'Montserrat-Light'
  },
});

export default memo(ForgotPasswordScreen);
