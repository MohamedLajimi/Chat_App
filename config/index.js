// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnNvFPL8KzDaRNBoHIDlDIh42Q1lVxMSs",
  authDomain: "whatsapp-clone-7e637.firebaseapp.com",
  projectId: "whatsapp-clone-7e637",
  storageBucket: "whatsapp-clone-7e637.firebasestorage.app",
  messagingSenderId: "1087927129841",
  appId: "1:1087927129841:web:f9f353c9a8aba2f6fc7b50"
};

// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);
export default firebase;