import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAcYQEgQFSkDK2zJwhr_tEVTywYc-sXXMQ",
  authDomain: "fir-auth-3694c.firebaseapp.com",
  projectId: "fir-auth-3694c",
  storageBucket: "fir-auth-3694c.appspot.com",
  messagingSenderId: "1004112228354",
  appId: "1:1004112228354:web:6683533badd21ed9ff371b",
  measurementId: "G-FN6TMPBF1E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For localhost development, disable network persistence to avoid CORS issues
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('Running on localhost - Firebase CORS issues may occur');
}