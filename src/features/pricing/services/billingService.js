import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../../../backend/firebase/firebase";

const readEnv = (viteKey, craKey, fallback = "") => {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    viteKey in import.meta.env
  ) {
    return import.meta.env[viteKey];
  }

  if (typeof process !== "undefined" && process.env && craKey in process.env) {
    return process.env[craKey];
  }

  return fallback;
};

const rawEnableBilling = readEnv(
  "VITE_ENABLE_BILLING",
  "REACT_APP_ENABLE_BILLING",
  "false",
);

export const ENABLE_BILLING = String(rawEnableBilling).toLowerCase() === "true";

export const getIdToken = async () => {
  if (!auth.currentUser) {
    return null;
  }

  return auth.currentUser.getIdToken();
};

export const createCheckoutSession = async ({
  returnPath = "/searchpage",
} = {}) => {
  const createSession = httpsCallable(functions, "createCheckoutSession");
  const result = await createSession({
    returnUrl: `${window.location.origin}${returnPath}`,
    cancelUrl: `${window.location.origin}/pricing`,
  });

  const checkoutUrl = result?.data?.url;

  if (!checkoutUrl || typeof checkoutUrl !== "string") {
    throw new Error("Missing checkout URL.");
  }

  return checkoutUrl;
};

export const createCustomerPortalSession = async ({
  returnPath = "/profilepage",
} = {}) => {
  const createPortal = httpsCallable(functions, "createCustomerPortalSession");
  const result = await createPortal({
    returnUrl: `${window.location.origin}${returnPath}`,
  });

  const portalUrl = result?.data?.url;

  if (!portalUrl || typeof portalUrl !== "string") {
    throw new Error("Missing portal URL.");
  }

  return portalUrl;
};
