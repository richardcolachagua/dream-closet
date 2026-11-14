import { serverTimestamp } from "firebase/firestore";

const text = (value, limit, fallback = "") => {
  const result =
    typeof value === "string" || typeof value === "number"
      ? String(value).trim()
      : "";
  return (result || fallback).slice(0, limit);
};
const url = (value, required = false) => {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate && !required) return "";
  try {
    const parsed = new URL(candidate);
    if (
      !["https:", "http:"].includes(parsed.protocol) ||
      candidate.length > 4096 ||
      /\s/.test(candidate)
    )
      throw new Error();
    return candidate;
  } catch {
    throw new Error(
      "This product has an invalid or missing retailer/image link.",
    );
  }
};
export const buildSavedItemPayload = (item = {}) => {
  const numericPrice = item.numericPrice;
  if (
    numericPrice != null &&
    (!Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      numericPrice > 1000000)
  ) {
    throw new Error("This product has an invalid numeric price.");
  }
  return {
    name: text(item.name || item.title, 300, "Untitled item"),
    imageUrl: url(item.imageUrl),
    price: text(item.price, 100, "Price unavailable"),
    numericPrice: numericPrice ?? null,
    productUrl: url(item.productUrl, true),
    brand: text(item.brand, 100),
    source: text(item.source, 100, "Unknown"),
    description: text(item.description, 4000),
    createdAt: serverTimestamp(),
  };
};
