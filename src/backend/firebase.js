import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB04zJ_CTxFziwVVW0d84ZuIcHgj6WXS0g",
  authDomain: "dream-closet-4d254.firebaseapp.com",
  projectId: "dream-closet-4d254",
  storageBucket: "dream-closet-4d254.appspot.com",
  messagingSenderId: "626211370865",
  appId: "1:626211370865:web:c547b9ab8b5d3f2a48e8d0",
  measurementId: "G-7H1K5D9B6J",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
