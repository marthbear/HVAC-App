// Import polyfill for React Native
import "react-native-get-random-values";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  enableNetwork
} from "firebase/firestore";
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

// Initialize Firebase Authentication
// Firebase v12 handles persistence automatically for both web and React Native
const auth = getAuth(app);

// Initialize Cloud Firestore with platform-specific settings
let db;
if (Platform.OS === "web") {
  // For web, initialize with long polling to prevent connection issues
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true
  });
} else {
  // For React Native, use default settings
  db = getFirestore(app);
}

export { auth, db };
export default app;
