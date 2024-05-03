// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGNHkZ1KJckPc8W_5Qs-j1auyK8apD4yE",
  authDomain: "file-uploader-afd03.firebaseapp.com",
  projectId: "file-uploader-afd03",
  storageBucket: "file-uploader-afd03.appspot.com",
  messagingSenderId: "322923746747",
  appId: "1:322923746747:web:8fb5f7f9e419e1d7a8609e",
  measurementId: "G-V4NFVTBWSW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
