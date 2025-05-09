// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-mXLgv7tgLwRMXWcKrFWg6MUI2vX9K48",
  authDomain: "react-final-project-367b6.firebaseapp.com",
  projectId: "react-final-project-367b6",
  storageBucket: "react-final-project-367b6.firebasestorage.app",
  messagingSenderId: "996907317194",
  appId: "1:996907317194:web:9bf9e3112c4cf3f5a6c133"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firebase = getfirestore(app);