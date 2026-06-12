import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
const functions = getFunctions(app, "us-central1");

setPersistence(auth, browserLocalPersistence).catch(() => {});

if (
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

const appCheckSiteKey = import.meta?.env?.VITE_FIREBASE_APPCHECK_SITE_KEY;

let appCheck = null;
if (typeof window !== "undefined" && appCheckSiteKey) {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

let analytics = null;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => {});

export { app, auth, db, functions, analytics, appCheck };
