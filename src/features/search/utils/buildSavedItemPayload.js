import { serverTimestamp } from "firebase/firestore";

const text = (value, limit, fallback = "") => {
  const result =
    typeof value === "string"
      ? value.trim()
      : typeof value === "number" && Number.isFinite(value)
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
    return `${parsed.protocol}${candidate.slice(candidate.indexOf(":") + 1)}`;
  } catch {
    throw new Error(
      "This product has an invalid or missing retailer/image link.",
    );
  }
};
export const buildSavedItemIdentity = (item = {}) => {
  const source = text(item.source, 100, "Unknown");
  if (!source) {
    throw new Error("This product is missing a retailer.");
  }
  const productUrl = url(item.productUrl, true);
  return [source.toLowerCase(), productUrl];
};

export const buildSavedItemPayload = (item = {}) => {
  const name = text(item.name || item.title, 300);
  const source = text(item.source, 100, "Unknown");
  if (!name) {
    throw new Error("This product is missing a usable name.");
  }
  const rawNumericPrice = item.numericPrice;
  const numericPriceText =
    typeof rawNumericPrice === "string" ? rawNumericPrice.trim() : null;
  const numericPrice =
    rawNumericPrice == null || numericPriceText === ""
      ? null
      : typeof rawNumericPrice === "number" ||
          (typeof rawNumericPrice === "string" &&
            /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(
              numericPriceText,
            ))
        ? Number(
            typeof rawNumericPrice === "number"
              ? rawNumericPrice
              : numericPriceText,
          )
        : NaN;
  if (
    numericPrice != null &&
    (!Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      numericPrice > 1000000)
  ) {
    throw new Error("This product has an invalid numeric price.");
  }
  return {
    name,
    imageUrl: url(item.imageUrl),
    price: text(item.price, 100, "Price unavailable"),
    numericPrice,
    productUrl: url(item.productUrl, true),
    brand: text(item.brand, 100),
    source,
    description: text(item.description, 4000),
    createdAt: serverTimestamp(),
  };
};
