// Import polyfill for React Native
import "react-native-get-random-values";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArRhcwfDufJmL6pkYwGff2XfPW2VneRTg",
  authDomain: "hvac-app-29f24.firebaseapp.com",
  projectId: "hvac-app-29f24",
  storageBucket: "hvac-app-29f24.firebasestorage.app",
  messagingSenderId: "113272780182",
  appId: "1:113272780182:web:4f315c0ef5c968578399b7",
  measurementId: "G-J4MHVTF7T8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native persistence
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export { auth };
export default app;
