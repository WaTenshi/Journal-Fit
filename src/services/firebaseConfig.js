import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// CONFIG DE TU FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDkmaLzhqRivNFuosEPvEk1lPpISQ_9ey4",
  authDomain: "journalfit.firebaseapp.com",
  projectId: "journalfit",
  storageBucket: "journalfit.firebasestorage.app",
  messagingSenderId: "195122399916",
  appId: "1:195122399916:web:71c58fd7da728559592d09",
  measurementId: "G-SBZXYT7H61",
};

// 1️⃣ Inicializar app sin duplicarla
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// 2️⃣ Inicializar AUTH de manera SEGURA
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Si ya existe, usamos el existente
  auth = getAuth(app);
}

// 3️⃣ Firestore
export const db = getFirestore(app);
export { auth };
