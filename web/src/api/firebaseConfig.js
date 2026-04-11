import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "[GCP_API_KEY]",
  authDomain: "agrolink-861f8.firebaseapp.com",
  databaseURL: "https://agrolink-861f8-default-rtdb.firebaseio.com",
  projectId: "agrolink-861f8",
  storageBucket: "agrolink-861f8.firebasestorage.app",
  messagingSenderId: "189604300014",
  appId: "1:189604300014:web:09f2021096936aa6671fff",
  measurementId: "G-PH5XX31VZ5"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export { ref, onValue, set, update };
