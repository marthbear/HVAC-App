// Import polyfill for React Native
import "react-native-get-random-values";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  enableNetwork,
  Firestore
} from "firebase/firestore";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    "Firebase configuration is missing. Please check your .env file and ensure all EXPO_PUBLIC_FIREBASE_* variables are set."
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
// Firebase v12 handles persistence automatically for both web and React Native
const auth = getAuth(app);

// Initialize Cloud Firestore with platform-specific settings
let db: Firestore;
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
