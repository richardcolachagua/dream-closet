import { httpsCallable } from "firebase/functions";
import { auth, authReady, functions } from "../../../backend/firebase/firebase";

const rawEnableBilling = process.env.REACT_APP_ENABLE_BILLING || "false";

export const ENABLE_BILLING =
  String(rawEnableBilling).trim().toLowerCase() === "true";

const requireBillingUser = async () => {
  if (!ENABLE_BILLING) {
    throw new Error("Billing is currently disabled in this environment.");
  }

  await authReady;

  const user = auth.currentUser;

  if (!user || user.isAnonymous) {
    throw new Error("Sign in to a registered account to manage billing.");
  }

  return user;
};

const readSessionUrl = (result, label) => {
  const value = result?.data?.url;

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${label} URL.`);
  }

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid ${label} URL.`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`Invalid ${label} URL protocol.`);
  }

  return parsed.href;
};

export const getIdToken = async () => {
  await authReady;

  if (!auth.currentUser) {
    return null;
  }

  return auth.currentUser.getIdToken();
};

export const createCheckoutSession = async ({
  returnPath = "/settingspage",
  cancelPath = "/pricing",
} = {}) => {
  await requireBillingUser();

  const createSession = httpsCallable(functions, "createCheckoutSession");

  const result = await createSession({
    returnPath,
    cancelPath,
  });

  return readSessionUrl(result, "checkout");
};

export const createCustomerPortalSession = async ({
  returnPath = "/settingspage",
} = {}) => {
  await requireBillingUser();

  const createPortal = httpsCallable(functions, "createCustomerPortalSession");

  const result = await createPortal({
    returnPath,
  });

  return readSessionUrl(result, "billing portal");
};
