
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhltKlhiciyG_xhXyeJp7yHFvnh2eXOCM",
  authDomain: "kose-qrmenu.firebaseapp.com",
  projectId: "kose-qrmenu",
  storageBucket: "kose-qrmenu.firebasestorage.app",
  messagingSenderId: "590144752392",
  appId: "1:590144752392:web:05f1b38aa63127fc677abd",
  measurementId: "G-7C50RWTKK8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
