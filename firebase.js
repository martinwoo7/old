import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getAuth, connectAuthEmulator, initializeAuth, getReactNativePersistence } from "firebase/auth";

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
const firestore = initializeFirestore(app, { experimentalAutoDetectLongPolling:true })

if (__DEV__) {
  console.log("Switching to local Firebase instance...")
  const origin = Constants.manifest.debuggerHost?.split(':').shift() || 'localhost'
  console.log("local ip is: ", origin)
  connectAuthEmulator(authentication, `http://${origin}:9099/`)
  // connectAuthEmulator(authentication, `https://51a1-2604-3d08-6f7f-c300-7d02-1c55-f4be-819a.ngrok.io`)
  connectFirestoreEmulator(firestore, origin, 8080)
}

const emulators = {authentication, firestore}
// export const db = getFirestore(app)
// connectFirestoreEmulator(db, 'localhost', 8080)
export default emulators





