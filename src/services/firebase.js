// src/services/firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// Config de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkmaLzhqRivNFuosEPvEk1lPpISQ_9ey4",
  authDomain: "journalfit.firebaseapp.com",
  projectId: "journalfit",
  storageBucket: "journalfit.firebasestorage.app",
  messagingSenderId: "195122399916",
  appId: "1:195122399916:web:46cdd0f0bd4e9a402451a0",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

async function saveUserData(uid, data) {
  if (!uid) return;

  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function getUserData(uid) {
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

async function updateUserData(uid, data) {
  if (!uid) return;

  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export { app, auth, db, saveUserData, getUserData, updateUserData };
