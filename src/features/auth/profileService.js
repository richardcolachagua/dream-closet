import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import {
  browserSessionPersistence,
  setPersistence,
  signOut,
} from "firebase/auth";
import { auth, authReady, db } from "../../backend/firebase/firebase";

const normalizeName = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);

export const prepareAccountSession = async () => {
  await authReady;
  await setPersistence(auth, browserSessionPersistence);
};

export const ensureUserProfile = async (user, names = {}) => {
  if (!user || user.isAnonymous || !user.email) {
    throw new Error("A registered account with an email address is required.");
  }

  const displayNames = String(user.displayName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstName = normalizeName(names.firstName ?? displayNames[0] ?? "");

  const lastName = normalizeName(
    names.lastName ?? displayNames.slice(1).join(" "),
  );

  const userRef = doc(db, "users", user.uid);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);

    if (snapshot.exists()) {
      return snapshot.data();
    }

    transaction.set(userRef, {
      firstName,
      lastName,
      email: user.email,
      onboarding: {
        gender: null,
        categories: [],
        brands: [],
        completed: false,
      },
      preferences: {
        emailNotifications: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      firstName,
      lastName,
      email: user.email,
      onboarding: {
        gender: null,
        categories: [],
        brands: [],
        completed: false,
      },
      preferences: {
        emailNotifications: false,
      },
    };
  });
};

export const finishAccountSignIn = async (user, names) => {
  try {
    return await ensureUserProfile(user, names);
  } catch (cause) {
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error(
        "Could not clear the session after profile setup failed:",
        signOutError,
      );
    }

    const error = new Error(
      "You signed in, but we couldn’t finish loading your profile. " +
        "Your Auth account has not been deleted. Sign in again to retry.",
    );

    error.code = "profile/initialization-failed";
    error.cause = cause;

    throw error;
  }
};
