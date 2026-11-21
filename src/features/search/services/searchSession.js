import { signInAnonymously } from "firebase/auth";
import { auth, authReady } from "../../../backend/firebase/firebase";

let anonymousSessionPromise = null;

export const searchIdentity = (user) =>
  user ? `${user.uid}:${user.isAnonymous ? "visitor" : "registered"}` : null;

export const assertSearchIdentity = (expectedIdentity) => {
  const user = auth.currentUser;
  if (!expectedIdentity || searchIdentity(user) !== expectedIdentity) {
    const error = new Error("Your account changed. Please try again.");
    error.code = "search/account-changed";
    throw error;
  }
  return user;
};

export const ensureVisitorSession = async () => {
  await authReady;
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;

  if (!anonymousSessionPromise) {
    anonymousSessionPromise = (async () => {
      if (auth.currentUser) return auth.currentUser;
      const credential = await signInAnonymously(auth);
      return credential.user;
    })().finally(() => {
      anonymousSessionPromise = null;
    });
  }
  return anonymousSessionPromise;
};
