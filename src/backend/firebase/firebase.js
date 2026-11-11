import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
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

const isDevelopment = process.env.NODE_ENV === "development";
const emulatorFlag = process.env.REACT_APP_USE_FIREBASE_EMULATORS;

const useEmulators = isDevelopment && emulatorFlag !== "false";

if (isDevelopment && !useEmulators) {
  throw new Error(
    "Local development against live Firebase is disabled in this setup. " +
      "Set REACT_APP_USE_FIREBASE_EMULATORS=true and start the emulators.",
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "us-central1");

const runtimeKey = "__dreamClosetFirebaseRuntimeV4";
const runtime = globalThis[runtimeKey] || {
  emulatorsConnected: false,
  persistencePromise: null,
  telemetryPromise: null,
  analytics: null,
  appCheck: null,
};

globalThis[runtimeKey] = runtime;

if (useEmulators && !runtime.emulatorsConnected) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  runtime.emulatorsConnected = true;

  console.info("[Dream Closet] Firebase emulators enabled", {
    projectId: firebaseConfig.projectId,
    auth: "127.0.0.1:9099",
    firestore: "127.0.0.1:8080",
    functions: "127.0.0.1:5001",
  });
}

if (!runtime.persistencePromise) {
  runtime.persistencePromise = setPersistence(
    auth,
    browserLocalPersistence,
  ).catch((error) => {
    console.warn(
      "[Dream Closet] Could not configure local auth persistence.",
      error,
    );
  });
}

const authReady = runtime.persistencePromise;

let analytics = runtime.analytics;
let appCheck = runtime.appCheck;

const initializeTelemetry = async () => {
  if (typeof window === "undefined" || useEmulators) {
    return;
  }

  const appCheckSiteKey = process.env.REACT_APP_FIREBASE_APPCHECK_SITE_KEY;

  if (appCheckSiteKey && !runtime.appCheck) {
    try {
      runtime.appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      console.error("[Dream Closet] App Check initialization failed.", error);
    }
  }

  if (process.env.REACT_APP_ENABLE_ANALYTICS === "true" && !runtime.analytics) {
    try {
      if (await isSupported()) {
        runtime.analytics = getAnalytics(app);
      }
    } catch (error) {
      console.warn("[Dream Closet] Analytics initialization failed.", error);
    }
  }
};

if (!runtime.telemetryPromise) {
  runtime.telemetryPromise = initializeTelemetry();
}

const telemetryReady = runtime.telemetryPromise.then(() => {
  analytics = runtime.analytics;
  appCheck = runtime.appCheck;
});

const logAnalyticsEvent = (eventName, parameters = {}) => {
  if (!runtime.analytics) {
    return;
  }

  try {
    logEvent(runtime.analytics, eventName, parameters);
  } catch (error) {
    console.warn(
      `[Dream Closet] Could not log analytics event: ${eventName}`,
      error,
    );
  }
};

export {
  app,
  auth,
  db,
  functions,
  analytics,
  appCheck,
  authReady,
  telemetryReady,
  useEmulators,
  logAnalyticsEvent,
};
