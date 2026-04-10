import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4TCFPEE9VD6XeVzVKcMDsxWUpiVlt-pw",
  authDomain: "agrolink-861f8.firebaseapp.com",
  projectId: "agrolink-861f8",
  storageBucket: "agrolink-861f8.firebasestorage.app",
  messagingSenderId: "189604300014",
  appId: "1:189604300014:web:09f2021096936aa6671fff",
  measurementId: "G-PH5XX31VZ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };
