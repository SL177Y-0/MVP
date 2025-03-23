import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, TwitterAuthProvider, signOut } from "firebase/auth";

// Get Firebase config from environment variables with fallbacks for development
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBTj84iQYRreRcaMro33syx5rZHYxM6dvw",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "proto-36642.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "proto-36642",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "proto-36642.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "783938316828",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:783938316828:web:0686d605db90634bc5cdd9",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E819QMZ9TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const twitterProvider = new TwitterAuthProvider();