import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCs1a_sE6MjbTno3cIU8vJZIjHIte2tm10",
  authDomain: "novo-impacto-x-pontos.firebaseapp.com",
  projectId: "novo-impacto-x-pontos",
  storageBucket: "novo-impacto-x-pontos.firebasestorage.app",
  messagingSenderId: "505539984524",
  appId: "1:505539984524:web:e140d4e3c80d4e398a4fa9",
  measurementId: "G-CMH2T7MEV2"
};

// Check if config is valid
const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Fallback for missing config to prevent crash
  console.warn("Firebase não configurado. Verifique as variáveis de ambiente VITE_FIREBASE_*");
  // We export proxies or nulls that will be handled by the UI
}

export { auth, db, isFirebaseConfigured };
