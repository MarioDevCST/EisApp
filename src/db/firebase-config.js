// src/db/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importa getAuth

// Tu objeto de configuración de Firebase Web (usando variables de entorno)
// Es importante exportar este objeto también para que la instancia temporal pueda usarlo.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID, // Opcional
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL, // Si tienes esta línea
};

// Inicializar la instancia principal de Firebase para la aplicación
const app = initializeApp(firebaseConfig);

// Inicializar los servicios principales de la aplicación
const db = getFirestore(app);
const auth = getAuth(app);

// Subrayado: Exportar también initializeApp, getAuth y firebaseConfig
// Esto permite que otros componentes creen instancias secundarias de Firebase
export { db, auth, initializeApp, getAuth, firebaseConfig };
