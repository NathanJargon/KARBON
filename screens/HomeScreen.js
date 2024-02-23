import React, { useState, useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../screens/FirebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Animated, TouchableHighlight } from 'react-native';
import { ImageBackground } from 'react-native';
import JapanFishPalette from './JapanFishPalette';
import Background from '../components/Background';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

function HomeScreen({ navigation }) {

  const [fadeAnim] = useState(new Animated.Value(1));
  const [elevationAnim] = useState(new Animated.Value(0));
  const [userName, setUserName] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  let initialMount = true;
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  

  useFocusEffect(
    React.useCallback(() => {
      if (initialMount) {
        setLoading(true);
        fetchUserData();
        initialMount = false;
      }
  
      return () => {};
    }, [])
  );


  useEffect(() => {
    Animated.timing(elevationAnim, {
      toValue: 5,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, []); 

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = doc(db, 'users', user.uid);
  
      const unsubscribe = onSnapshot(userDoc, (doc) => {
        const userProfile = doc.data().profile || null;
        const userName = doc.data().name || null;
  
        setUserProfileImage(userProfile);
        setUserName(userName);
      });
  
      // Clean up the subscription on unmount
      return () => unsubscribe();
    }
  }, []);
  
  const navigateToScreen = (screenName) => {
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      navigation.navigate(screenName);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }).start();
    });
  };

  const fetchUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      if (jsonValue != null) {
        const userData = JSON.parse(jsonValue);
        const userDoc = doc(db, 'users', userData.user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userName = userSnap.data().name || null;
          const userProfile = userSnap.data().profile || null;

          setUserName(userName);
          setUserProfileImage(userProfile);
          setLoading(false);
        }
      } else {
        const user = auth.currentUser;
        if (user) {
          const userDoc = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);
      
          if (userSnap.exists()) {
            const userName = userSnap.data().name || null;
            const userProfile = userSnap.data().profile || null;
      
            setUserName(userName);
            setUserProfileImage(userProfile);
            setLoading(false);
          }
        }
      }
      return () => unsub();

    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <ImageBackground source={require('../assets/homebg.jpg')} style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', color: 'white' }}>Loading..</Text>
      </View>
      </ImageBackground>
    );
  }


  return (
    
    <ImageBackground source={require('../assets/homebg.jpg')} style={styles.container}>
      <View style={styles.headerImage}>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: windowHeight * 0.05, alignItems: 'center' }}>
                {/* Profile User Icon to the Right */}
        <TouchableOpacity onPress={() => { navigateToScreen('Profile') }} style={styles.profileIcon}>
          {userProfileImage ? (
            <Image source={{ uri: userProfileImage }} style={{ width: 45, height: 45, borderRadius: 20 }} />
          ) : (
            <Image source={require('../assets/icons/leaderboardIcon.png')} style={{ width: 40, height: 40, borderRadius: 0 }} />
          )}
          <Text style={styles.welcomeText}>
            {userName ? `${userName}` : 'username'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', padding: windowHeight * 0.035 }}>
        <Text style={styles.logoText}>Welcome to</Text>
        <Text style={styles.logoTextBig}>KARBON</Text>
        <Text style={styles.subText1}>Your journey to a sustainable</Text>
        <Text style={styles.subText2}>tomorrow starts here.</Text>
      </View>


      </View>



      <View style={{ marginTop: windowHeight * 0.05 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContainer]}
          scrollEventThrottle={16}
        >
          <View style={styles.row}>

              {/* Box 1 */}
              <View style={styles.box1}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  underlayColor={JapanFishPalette.text8}
                  onPress={() => navigateToScreen("Calculator")}
                >
                  <Text style={styles.text10}>Record and</Text>
                  <Text style={styles.text11}>calculate your</Text>
                  <Text style={styles.text12}>carbon emissions</Text>
                  <Image source={require('../assets/icons/calculator1.png')} style={{ width: 80, height: 80, alignSelf: 'center', marginTop: windowHeight * 0.035, resizeMode: 'contain', }} />
                </TouchableOpacity>
              </View>

              {/* Box 2 */}
              <View style={styles.box2}>
              <TouchableOpacity
                activeOpacity={0.6}
                underlayColor={JapanFishPalette.text8}
                onPress={() => navigateToScreen("Map")}
              >
                  <Text style={styles.text21}>Know the fastest</Text>
                  <Text style={styles.text22}>and cleanest</Text>
                  <Text style={styles.text23}>route to your</Text>
                  <Text style={styles.text24}>destination</Text>
                <Image source={require('../assets/icons/place.png')} style={{ width: 60, height: 60, alignSelf: 'center', marginTop: windowHeight * 0.025, resizeMode: 'contain', }} />
              </TouchableOpacity>
              </View>

          </View>

          {/* Box 3 */}
          <View style={styles.row}>

          <View style={styles.box3}>
              <TouchableOpacity
                activeOpacity={0.6}
                underlayColor={JapanFishPalette.text8}
                onPress={() => navigateToScreen("Statistics")}
              >

                  <Text style={styles.text31}>View your records</Text>
                  <Text style={styles.text32}>and data of your</Text>
                  <Text style={styles.text33}>carbon footprint</Text>
                  <Image source={require('../assets/icons/data1.png')} style={{ width: 70, height: 70, alignSelf: 'center', marginTop: windowHeight * 0.035, resizeMode: 'contain', }} />
              </TouchableOpacity>
            </View>

              <View style={styles.box4}>
              <TouchableOpacity
                activeOpacity={0.6}
                underlayColor={JapanFishPalette.text8}
                onPress={() => navigateToScreen("Profile")}
              >
                  <Text style={styles.text41}>Edit your</Text>
                  <Text style={styles.text42}>personal profile</Text>
                  <Image source={require('../assets/icons/resume.png')} style={{ width: 65, height: 65, alignSelf: 'center', marginLeft: windowWidth * 0.02, marginTop: windowHeight * 0.065, resizeMode: 'contain', }} />
                
              </TouchableOpacity>
            </View>
          </View>
          
        </ScrollView>
      </View>
    </ImageBackground>
  );
}


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;



const styles = StyleSheet.create({
  box1: {
    width: windowWidth * 0.40, // 35% of screen width
    height: windowHeight * 0.24, // 20% of screen height
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Set the background color and opacity
    margin: windowWidth * 0.02,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 10,
    marginTop: -windowHeight * 0.001,
  },

  box2: {
    width: windowWidth * 0.40, // 35% of screen width
    height: windowHeight * 0.24, // 20% of screen height
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Set the background color and opacity
    margin: 0,
    borderRadius: 12,
    margin: windowWidth * 0.02,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 10,
    marginTop: -windowHeight * 0.001,
  },

  box3: {
    width: windowWidth * 0.40, // 35% of screen width
    height: windowHeight * 0.24, // 20% of screen height
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Set the background color and opacity
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 10,
    marginTop: -windowHeight * 0.001,
  },

  box4: {
    width: windowWidth * 0.40, // 35% of screen width
    height: windowHeight * 0.24, // 20% of screen height
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Set the background color and opacity
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.50,
    shadowRadius: 5.84,
    elevation: 10,
    marginTop: -windowHeight * 0.001,
  },
  profileIcon: {
    flexDirection: 'row', // Add this line
    alignItems: 'center', // Align items vertically
    marginTop: windowHeight * 0.02, // Adjusted
    marginRight: 15,
    width: windowWidth * 1, // 10% of screen width
    height: windowWidth * 0.12,
  },
  logoText: {
    fontFamily: 'Montserrat-Light',
    fontSize: 40,
    textAlign: 'center',
    top: -windowHeight * 0.05, // Adjusted
    color: 'white',
  },
  logoTextBig: {
    fontFamily: 'Roc',
    fontSize: 50,
    textAlign: 'center',
    top: -windowHeight * 0.05, // Adjusted
    color: 'white',
  },
  subText1: {
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
    textAlign: 'center',
    top: -windowHeight * 0.05, // Adjusted
    color: 'white',
  },
  subText2: {
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
    textAlign: 'center',
    top: -windowHeight * 0.05, // Adjusted
    color: 'white',
  },
  welcomeText: {
    fontFamily: 'Codec',
    fontSize: 20,
    marginTop: windowHeight * 0.005,
    marginLeft: windowWidth * 0.009,
    color: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidth,
    height: windowHeight,
  },
  headerImage: {
    marginTop: 200,
    width: windowWidth * 1,
    height: windowHeight * 0.35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden'
  },  
  scrollContainer: {
    flexGrow: 1,
  },
  touchableHighlight: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5, 
    marginBottom: 10, 
  },  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  text10: {
    marginTop: windowHeight * 0.009,
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text11: {
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text12: {
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text21: {
    marginTop: windowHeight * 0.009,
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    overflow: 'hidden',
    color: 'white',
  },
  text22: {
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text23: {
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text24: {
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text31: {
    marginTop: windowHeight * 0.009,
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text32: {
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text33: {
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text41: {
    marginTop: windowHeight * 0.009,
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
  text42: {
    textAlign: 'center',
    color: JapanFishPalette.text10,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
});


export default HomeScreen;
