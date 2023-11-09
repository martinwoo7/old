import Constants from "expo-constants";
import 'firebase/firestore'
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  connectFirestoreEmulator,
  CACHE_SIZE_UNLIMITED, 
  getFirestore
} from "firebase/firestore";
import {
  connectAuthEmulator, 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth
} from "firebase/auth";
import { 
  getStorage, 
  connectStorageEmulator,
} from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

import AsyncStorage from "@react-native-async-storage/async-storage";

// const firebaseConfig = {
//     apiKey: "AIzaSyAd1aMBlnBVu4XqaehLahwF3oPNJTazqM4",
//     authDomain: "old-people-finder.firebaseapp.com",
//     databaseURL: "https://old-people-finder-default-rtdb.firebaseio.com",
//     projectId: "old-people-finder",
//     storageBucket: "old-people-finder.appspot.com",
//     messagingSenderId: "907992505145",
//     appId: "1:907992505145:web:3a2074fb21f0e071ca66e8",
//     measurementId: "G-LVXMNWMJ4Q"
// };

const firebaseConfig = {
  apiKey: 'any',
  projectId: 'demo-project',
};

const app = initializeApp(firebaseConfig)
const authentication = initializeAuth(app, {persistence: getReactNativePersistence(AsyncStorage)})
const firestore = initializeFirestore(app, {experimentalAutoDetectLongPolling: true})

// const authentication = getAuth(app)
// const firestore = getFirestore(app)
const functions = getFunctions(app)
const storage = getStorage(app)

if (__DEV__) {
  console.log("Switching to local Firebase instance...")
  const origin = Constants.manifest.debuggerHost?.split(':').shift() || 'localhost'
  console.log("local ip is: ", origin)
  connectAuthEmulator(authentication, `http://${origin}:9099/`)
  connectFunctionsEmulator(functions, origin, 5001);
  connectFirestoreEmulator(firestore, origin, 8080)
  connectStorageEmulator(storage, origin, 9199)
}

const emulators = {authentication, firestore, storage}
export default emulators





