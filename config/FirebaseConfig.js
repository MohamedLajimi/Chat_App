
import app from "firebase/compat/app";
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnNvFPL8KzDaRNBoHIDlDIh42Q1lVxMSs",
  authDomain: "whatsapp-clone-7e637.firebaseapp.com",
  projectId: "whatsapp-clone-7e637",
  storageBucket: "whatsapp-clone-7e637.firebasestorage.app",
  messagingSenderId: "1087927129841",
  appId: "1:1087927129841:web:f9f353c9a8aba2f6fc7b50"
};

const firebase = app.initializeApp(firebaseConfig);
export default firebase;



