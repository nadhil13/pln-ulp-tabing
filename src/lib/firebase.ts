import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration - PLN Gudang Barang
export const firebaseConfig = {
  apiKey: "AIzaSyDC2Y74RUUv42TBf7XwADik2qlzW4OYUxE",
  authDomain: "gudangbarangya.firebaseapp.com",
  projectId: "gudangbarangya",
  storageBucket: "gudangbarangya.firebasestorage.app",
  messagingSenderId: "876179737101",
  appId: "1:876179737101:web:bd432ca52a39d4336e2344",
  measurementId: "G-KTX1C7LBFX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

export default app;
