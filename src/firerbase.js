import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyD75UeFFs-wUiALXRe5lmPgBUf5AnOm_w4",
    authDomain: "autopianosoft.firebaseapp.com",
    projectId: "autopianosoft",
    storageBucket: "autopianosoft.appspot.com",
    messagingSenderId: "904999374466",
    appId: "1:904999374466:web:d749dd731b2be014cf2e9b",
    measurementId: "G-KZREQJ70K7"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }