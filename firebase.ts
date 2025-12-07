
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAFIyebazEcxgUoerzoAL4G-miSnMkRwVM",
  authDomain: "veggiego-23269.firebaseapp.com",
  databaseURL: "https://veggiego-23269-default-rtdb.firebaseio.com",
  projectId: "veggiego-23269",
  storageBucket: "veggiego-23269.firebasestorage.app",
  messagingSenderId: "978626846670",
  appId: "1:978626846670:web:51a3dd78e98cbe5377959f",
  measurementId: "G-2SLQSVYFEX"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);