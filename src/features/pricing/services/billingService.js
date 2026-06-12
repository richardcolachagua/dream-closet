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
