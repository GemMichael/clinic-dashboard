
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyCV2W60UqjENenGaP0BTG6EiMaY6klYhOU",
  authDomain: "clinic-alert.firebaseapp.com",
  databaseURL: "https://clinic-alert-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "clinic-alert",
  storageBucket: "clinic-alert.firebasestorage.app",
  messagingSenderId: "249058900193",
  appId: "1:249058900193:web:0f22e8940db1978c6b1fa0",
  measurementId: "G-YRRT1KHF1L"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);