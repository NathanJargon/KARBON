import React, { useState, useEffect } from 'react';

import { View, TouchableOpacity, Text, Image, ImageBackground } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { AppLoading } from 'expo';
import KarbonStatistics from './screens/KarbonStatisticsScreen.js';
import KarbonCalculator from './screens/KarbonCalculator.js';
import EducationScreen from './screens/EducationScreen';
import KarbonLeaderboard from './screens/KarbonLeaderboard.js';
import KarbonMap from './screens/KarbonMapScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Profile from './screens/Profile';
import Step1 from './screens/Step1';
import Step2 from './screens/Step2';

// login
import LoginHomeScreen from './screens/LoginHomeScreen.tsx';
import RegisterScreen from './screens/RegisterScreen.tsx';
import LoginScreen from './screens/LoginScreen.tsx';
import Dashboard from './screens/Dashboard.tsx';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.tsx';

const carLoanColor = require('./assets/icons/car-loan-color.png');
const direction = require('./assets/icons/direction.png');
const directionColor = require('./assets/icons/direction-color.png');
const home = require('./assets/icons/house.png');
const homeColor = require('./assets/icons/house-color.png');
const analytics = require('./assets/icons/analytics.png');
const analyticsColor = require('./assets/icons/analytics-color.png');
const carLoan = require('./assets/icons/car-loan.png');
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();


function RootStackScreen() {
  return (
    <RootStack.Navigator initialRouteName="HomeScreen">
      <RootStack.Screen name="HomeScreen" component={LoginHomeScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
      <RootStack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
    </RootStack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="HomeStack">
      <Stack.Screen name="HomeStack" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="Calculator" component={KarbonCalculator} options={{ headerShown: false }} />
      <Stack.Screen name="Karbon Leaderboard" component={KarbonLeaderboard} options={{ headerShown: false }}/>
      <Stack.Screen name="Details" component={KarbonStatistics} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function HomeScreenStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="Karbon Leaderboard" component={KarbonLeaderboard} options={{ headerShown: false }}/>
      <Stack.Screen name="Calculator" component={KarbonCalculator} options={{ headerShown: false }} />
      <Stack.Screen name="Statistics" component={KarbonStatistics} options={{ headerShown: false }} />
      <Stack.Screen name="Map" component={KarbonMap} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function KarbonMapStack() {
  return (
    <Stack.Navigator initialRouteName="KarbonMapScreen">
      <Stack.Screen name="KarbonMapScreen" component={KarbonMap} options={{ headerShown: false }} />
      <Stack.Screen name="Karbon Leaderboard" component={KarbonLeaderboard} options={{ headerShown: false }}/>
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}

function KarbonStatisticsStack() {
  return (
    <Stack.Navigator initialRouteName="KarbonStatistics">
      <Stack.Screen name="KarbonStatistics" component={KarbonStatistics} options={{ headerShown: false }} />
      <Stack.Screen name="Karbon Leaderboard" component={KarbonLeaderboard} options={{ headerShown: false }}/>
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <ImageBackground 
      source={require('./assets/botnav.png')} 
  >
      <View
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3,
        }} 
      >
        <View style={{ flexDirection: 'row', marginTop: 'auto', bottom: 5 }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

          if (!isFocused && !event.defaultPrevented) {
            navigation.reset({
              index: 0,
              routes: [{ name: route.name }],
            });
          }
        };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityStates={isFocused ? ['selected'] : []}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}
            >
              <View style={{ padding: 10 }}>
                {label === 'Home' ? (
                  <Image source={isFocused ? homeColor : home} style={{width: 30, height: 30}} />
                ) : label === 'Karbon Calculator' ? (
                  <Image source={isFocused ? carLoanColor : carLoan} style={{width: 30, height: 30}} />
                ) : label === 'Karbon Statistics' ? (
                  <Image source={isFocused ? analyticsColor : analytics} style={{width: 30, height: 30}} />
                ) : label === 'Karbon Map' ? (
                  <Image source={isFocused ? directionColor : direction} style={{width: 30, height: 30}} />
                ) : (
                  <Icon name="circle-o" size={30} color={isFocused ? '#4caf50' : '#222'} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      </View>
    </ImageBackground>
  );
}

function MainTabNavigator() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator initialRouteName="Home" tabBar={props => <CustomTabBar {...props} />}>

    <Tab.Screen 
      name="Home" 
      component={HomeScreenStack} 
      options={{
        headerShown: false,
        headerTitle: '',
      }}/>

  <Tab.Screen 
    name="Karbon Calculator" 
    component={KarbonCalculator} 
    options={{ headerShown: false }}
  />

  <Tab.Screen 
    name="Karbon Map" 
    component={KarbonMapStack} 
    options={{ headerShown: false }}
  />

  <Tab.Screen 
    name="Karbon Statistics" 
    component={KarbonStatisticsStack} 
    options={{ headerShown: false }}
  />
    </Tab.Navigator>
  );
}

function NavigationHandler() {
  const navigation = useNavigation();
  let [fontsLoaded] = useFonts({
    'Codec': require('./assets/fonts/Codec.ttf'),
    'Horizon': require('./assets/fonts/Horizon.ttf'),
    'Montserrat-Light': require('./assets/fonts/Montserrat Light.otf'),
    'Roc': require('./assets/fonts/Roc.otf')
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    AsyncStorage.getItem('user').then((userDataString) => {
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const currentTime = new Date().getTime();
        // Check if less than 30 minutes have passed
        if (currentTime - userData.loginTime < 100000 * 60 * 1000) {
          navigation.navigate('Main');
        }
      }
    });
  }, [fontsLoaded, navigation]);

  if (!fontsLoaded) {
    return null;
  }

  return <RootStackScreen />;
}

export default function App() {
  return (
    <NavigationContainer>
      <NavigationHandler />
    </NavigationContainer>
  );
}
