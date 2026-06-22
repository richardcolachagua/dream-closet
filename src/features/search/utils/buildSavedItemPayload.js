import { serverTimestamp } from "firebase/firestore";

export const buildSavedItemPayload = (item, userId) => ({
  userId,
  itemId: String(item.itemId || ""),
  name: item.name || item.title || "",
  imageUrl: item.imageUrl || "",
  price: item.price || "Price unavailable",
  numericPrice:
    typeof item.numericPrice === "number" ? item.numericPrice : null,
  productUrl: item.productUrl || "",
  brand: item.brand || "",
  source: item.source || "",
  description: item.description || "",
  createdAt: serverTimestamp(),
});
