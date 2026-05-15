import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6l4ZUrM1U1FmTB-u2jdWfNmbq1KDFWd0",
  authDomain: "workaxis-25d6d.firebaseapp.com",
  projectId: "workaxis-25d6d",
  storageBucket: "workaxis-25d6d.firebasestorage.app",
  messagingSenderId: "825260718316",
  appId: "1:825260718316:web:7c656f2ef6d9169da04dc9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);