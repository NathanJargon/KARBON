import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, ImageBackground, Image, Linking, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { auth, db } from '../screens/FirebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import { doc, getDoc, onSnapshot } from 'firebase/firestore';


const KarbonMap = (props) => {
  const apiKey = 'AIzaSyCxLGmhSPj8MZ-K-JVMae_90_rz7s-3S4M'; // Replace with your actual Google Maps API key

  const philippinesRegion = {
    latitude: 13.41,
    longitude: 122.56,
    latitudeDelta: 20,
    longitudeDelta: 20,
  };

  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [emissionStatus, setEmissionStatus] = useState('Low'); 
  const [trafficLevel, setTrafficLevel] = useState('Light'); 
  const [timeToReach, setTimeToReach] = useState('0 min'); 
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [region, setRegion] = useState(philippinesRegion);
  const markerRefs = useRef([]);
  let totalDistance = 0;
  let totalEmissions = 0;
  const modeOfTransportation = 'driving';
  const [isLoaded, setIsLoaded] = useState(false);
  const [markedPlace, setMarkedPlace] = useState(null);
  const userDistance = userLocation && selectedPlace ? calculateDistance(userLocation.latitude, userLocation.longitude, selectedPlace.latitude, selectedPlace.longitude) : 0;
  const markedDistance = userLocation && markedPlace ? calculateDistance(userLocation.latitude, userLocation.longitude, markedPlace.latitude, markedPlace.longitude) : 0;
  let locationSubscription = null;
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    startLocationTracking();
    return () => {
      stopLocationTracking();
    };
  }, []);
  
  const clearMarkers = () => {
    setSelectedPlaces([]);
    setDirections([]);
    markerRefs.current = [];
  };


  useEffect(() => {
    const checkLocationServices = async () => {
      const hasServicesEnabled = await Location.hasServicesEnabledAsync();
      if (hasServicesEnabled) {
        startLocationTracking();
      } else {
        stopLocationTracking();
      }
    };
  
    const interval = setInterval(checkLocationServices, 1000); // Check every second
  
    return () => clearInterval(interval);
  }, []);


  const startLocationTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // handle permission not granted scenario
      return;
    }
  
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000, // Update every second
        distanceInterval: 1, // Or update every meter traveled
      },
      (location) => {
        setUserLocation(location.coords);
        // Recalculate distance here
      }
    );
  };
  
  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }
  };


  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180)
  }


  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'This app needs location permissions to work correctly. Please go to settings and enable location permission for this app.',
            [
              { text: 'Go to Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel', onPress: () => {}, style: 'cancel' },
            ]
          );
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
  
    getLocation();
    setEmissionStatus('Low');
    setTrafficLevel('Light');
    setTimeToReach('10 min');
  }, []);

  const handleRegionChange = (newRegion) => {
    setSelectedPlace(null);
  };


  const calculateAndUpdateDistanceAndEmission = async () => {
    try {
      const place = selectedPlaces[selectedPlaces.length - 1];
  
      // Check if place is defined before trying to use its properties
      if (place && userLocation) {
        const directionsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?` +
          `origin=${userLocation.latitude},${userLocation.longitude}` +
          `&destination=${place.latitude},${place.longitude}` +
          '&mode=driving' +
          '&alternatives=true' + 
          `&key=${apiKey}`
        );
  
  
      const directionsData = await directionsResponse.json();

      if (directionsData && directionsData.routes && directionsData.routes.length > 0) {
        const route = directionsData.routes[0];
        const legs = route.legs && route.legs.length > 0 ? route.legs[0] : null;
  
        if (legs) {
          const newDirections = decodePolyline(route.overview_polyline.points);
          setDirections(newDirections);
  
          // Set time to reach
          const timeToReach = legs.duration.text;
          setTimeToReach(timeToReach);
  
          // Calculate emission status
          const distance = legs.distance.value; // distance in meters
          const emissionStatus = calculateEmissionStatus(distance);
          setEmissionStatus(emissionStatus);
  
          // Calculate traffic level
          const duration = legs.duration ? legs.duration.value : 0; // duration in seconds
          const durationInTraffic = legs.duration_in_traffic ? legs.duration_in_traffic.value : 0; // duration in traffic in seconds
          const trafficLevel = calculateTrafficLevel(duration, durationInTraffic);
          setTrafficLevel(trafficLevel);
  
          // Update distance count and approximate carbon emission
          totalDistance += distance / 1000; // convert meters to kilometers
          totalEmissions += calculateCarbonEmission(distance, modeOfTransportation);
        }
      }
    }
  } catch (error) {
    console.error('Error in calculateAndUpdateDistanceAndEmission:', error);
  }
};

  const handleGetDirections = async () => {
    try {
      setLoading(true);
      await calculateAndUpdateDistanceAndEmission();
      setIsNavigating(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Periodically update distance and emission
  useEffect(() => {
    const interval = setInterval(async () => {
      await calculateAndUpdateDistanceAndEmission();
    }, 1 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  // Calculate emission status based on distance
  const calculateEmissionStatus = (distance) => {
    if (distance < 1000) {
      return 'Low';
    } else if (distance < 5000) {
      return 'Medium';
    } else {
      return 'High';
    }
  };

  // Calculate traffic level based on duration and duration in traffic
  const calculateTrafficLevel = (duration, durationInTraffic) => {
    const ratio = durationInTraffic / duration;
    if (ratio < 1.05) {
      return 'Light';
    } else if (ratio < 1.2) {
      return 'Medium';
    } else {
      return 'Heavy';
    }
  };


  const calculateCarbonEmission = (distance) => {
    const emissionFactor = 0.12; 
    const carbonEmission = distance * emissionFactor;
    return carbonEmission;
  };


  useEffect(() => {
    if (selectedPlaces.length > 0) {
      setTimeout(() => {
        markerRefs.current[selectedPlaces.length - 1].showCallout();
      }, 100);
    }
  }, [selectedPlaces]);

  const handleMapPress = (coordinate) => {
    if (isNavigating) {
      return;
    }

    setSelectedPlaces((prevPlaces = []) => {
      let newPlaces = [...prevPlaces, coordinate];
      if (newPlaces.length > 5) {
        newPlaces = newPlaces.slice(1);
      }
      return newPlaces;
    });
  };

  return (
        <ImageBackground
          source={require('../assets/mapbg.png')}
          resizeMode="cover"
          style={{ flex: 1, width: '100%' }}
        >
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={styles.header}>KARBON MAP</Text>
            <Text style={{ textAlign: 'center', fontSize: 12, fontFamily: 'Montserrat-Light', marginTop: -50 }}>to reduce carbon emissions.</Text>
            <Text style={{ textAlign: 'center', fontSize: 12, fontFamily: 'Montserrat-Light' }}>Select the best route</Text>
      
            <View style={styles.container}>
              <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={handleRegionChange}
            showsUserLocation={true}
            onPress={(e) => handleMapPress(e.nativeEvent.coordinate)}
          >
        {selectedPlaces.map((place, index) => (
          <Marker
            key={index}
            coordinate={place}
            title={`Place you want to go`}
            ref={(ref) => { markerRefs.current[index] = ref; }} 
          />
        ))}

        {selectedPlace && (
          <Marker
            coordinate={{ latitude: selectedPlace.latitude, longitude: selectedPlace.longitude }}
            title={selectedPlace.name}
            pinColor="red"
          />
        )}

        {directions.length > 0 && userLocation && selectedPlace && (
          <MapViewDirections
            origin={userLocation}
            destination={{ latitude: selectedPlace.latitude, longitude: selectedPlace.longitude }}
            apikey={apiKey}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}

          {directions && (
            <Polyline
              coordinates={directions}
              strokeColor="#0000FF" // Blue color
              strokeColors={[
                '#7F0000',
                '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                '#B24112',
                '#E5845C',
                '#238C23',
                '#7F0000'
              ]}
              strokeWidth={6}
            />
          )}
      </MapView>

      <View style={styles.infoContainer}>
      <Text style={[styles.infoTitle, { textAlign: 'center', marginBottom: 5, fontSize: 10, textDecorationLine: 'underline' }]}>Navigation Data</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>Emission Status:</Text>
          <Text style={styles.infoValue}>{emissionStatus}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>Traffic Level:</Text>
          <Text style={styles.infoValue}>{trafficLevel}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>Time to Reach:</Text>
          <Text style={styles.infoValue}>{timeToReach}</Text>
        </View>
      </View>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={handleGetDirections}
          disabled={isNavigating}
          style={[styles.cardContainer, { flex: 1, margin: 10, backgroundColor: 'transparent' }]}
        >
          <ImageBackground source={require('../assets/nav7.png')} style={styles.profileBox}>
            <View style={styles.profileContainer}>
              <Image source={require('../assets/icons/send.png')} style={styles.leaderboardIcon} />
                <Text style={styles.leaderboardText}>
                  {isNavigating ? 'DIRECTION SET' : 'GET DIRECTION'}
                </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Confirmation",
              "Are you sure you have arrived at the location?",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                { 
                  text: "Yes", 
                  onPress: () => {
                    Alert.alert(
                      "Congratulations, you have arrived!",
                      `Kilometers reached: ${userDistance}\nMarked distance: ${markedDistance}`
                    );
                    clearMarkers();
                    setIsNavigating(false);
                  } 
                }
              ]
            );
          }}
          style={[styles.cardContainer, { flex: 1, margin: 10, backgroundColor: 'transparent' }]}
        >
          <ImageBackground source={require('../assets/nav7.png')} style={styles.profileBox}>
            <View style={styles.profileContainer}>
              <Image source={require('../assets/icons/arrival.png')} style={styles.leaderboardIcon} />
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.leaderboardText}>ARRIVED AT</Text>
                <Text style={styles.leaderboardText}>LOCATION</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>

    </View>
  </View>
    </ImageBackground>
  );
};


const decodePolyline = (encoded) => {
  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    const latlng = {
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    };
    poly.push(latlng);
  }
  return poly;
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    justifyContent: 'center', // Change this
    alignItems: 'center', // Change this
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  leaderboardText: {
    fontSize: 10,
    fontFamily: 'Codec',
  },
  leaderboardButton: {
    width: '100%',
    height: 60,
    marginTop: 20,
  },
  leaderboardBackground: {
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileBox: {
    width: 165,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center', // Add this line
    alignItems: 'center', // Add this line
  },
  header: {
    fontSize: 35,
    fontFamily: 'Codec',
    textAlign: 'center',
    padding: 30,
  },
  infoContainer: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'column',
    marginBottom: 10, 
    textAlign: 'center',
    fontFamily: 'Codec',
  },
  infoTitle: {
    fontFamily: 'Codec',
    fontSize: 10,
  },
  infoValue: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Montserrat-Light',
  },
  mapContainer: {
    width: windowWidth * 0.9, // 90% of screen width
    height: windowHeight * 0.59, // 40% of screen height
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6, 
    borderColor: 'green',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20, // Add this line
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default KarbonMap;
