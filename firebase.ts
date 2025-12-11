
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Configuration based on your google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyCM5um7zXq6p-eGL8ZG3IlDgwmRrMNegss",
  authDomain: "veggiego-23269.firebaseapp.com",
  databaseURL: "https://veggiego-23269-default-rtdb.firebaseio.com",
  projectId: "veggiego-23269",
  storageBucket: "veggiego-23269.firebasestorage.app",
  messagingSenderId: "978626846670",
  appId: "1:978626846670:web:51a3dd78e98cbe5377959f",
  measurementId: "G-2SLQSVYFEX"
};

// Initialize Firebase using the Modular SDK pattern
const app = initializeApp(firebaseConfig);

// Export instances
export const db = getDatabase(app);
export const auth = getAuth(app);

// Use auth language setting if needed (Modular way)
auth.useDeviceLanguage();

export default app;
