import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase config is intentionally public — security is enforced via Firebase Database Rules
// Reference: https://firebase.google.com/docs/projects/api-keys
const firebaseConfig = {
  apiKey: "AIzaSyCA0q_aWmV6cec_uJc6g5Wjl87SL9wrqGY",
  authDomain: "wolfnight-party.firebaseapp.com",
  databaseURL: "https://wolfnight-party-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wolfnight-party",
  storageBucket: "wolfnight-party.firebasestorage.app",
  messagingSenderId: "199029020061",
  appId: "1:199029020061:web:633f34b7191a2e68de4b74",
};

// Prevent duplicate Firebase app initialization during Vite hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getDatabase(app);
