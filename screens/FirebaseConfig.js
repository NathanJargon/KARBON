import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { setLogLevel, LogLevel } from '@firebase/logger';

const firebaseConfig = {
  apiKey: "AIzaSyCxLGmhSPj8MZ-K-JVMae_90_rz7s-3S4M",
  authDomain: "karbon-413610.firebaseapp.com",
  projectId: "karbon-413610",
  storageBucket: "karbon-413610.appspot.com",
  messagingSenderId: "658020520807",
  appId: "1:658020520807:web:d8d3eb704207f5033455c2",
  measurementId: "G-CJHLL5X62C"
};

setLogLevel(LogLevel.ERROR);
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Initialize Firebase Authentication with AsyncStorage for persistence
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const storage = getStorage(firebaseApp);

export { auth, db, collection, storage, firebaseApp };