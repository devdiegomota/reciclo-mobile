import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyC1mYMyPVC9V54aQF1L5tQuKnK7iCBVT0A",
    authDomain: "reciclo-mobile.firebaseapp.com",
    projectId: "reciclo-mobile",
    storageBucket: "reciclo-mobile.firebasestorage.app",
    messagingSenderId: "962688953921",
    appId: "1:962688953921:web:259a9bab5c033829f720c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
