export const formatProductPrice = (result = {}) => {
  const value = result.numericPrice;
  if (Number.isFinite(value) && value >= 0) {
    if (/^[A-Z]{3}$/.test(result.currency || "")) {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency", currency: result.currency,
        }).format(value);
      } catch {
        // Preserve the amount without inventing a currency.
      }
    }
    return `${value.toLocaleString("en-US")} (currency unconfirmed)`;
  }
  return typeof result.price === "string" && result.price.trim()
    ? result.price : "Price unavailable";
};
