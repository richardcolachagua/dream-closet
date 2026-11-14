import { buildSavedSearchPayload } from "./savedDataService";
import {
  buildSavedItemIdentity,
  buildSavedItemPayload,
} from "../search/utils/buildSavedItemPayload";
jest.mock("../../backend/firebase/firebase", () => ({
  auth: {},
  db: {},
  authReady: Promise.resolve(),
}));
jest.mock("firebase/firestore", () => ({
  serverTimestamp: jest.fn(() => "server-timestamp"),
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  runTransaction: jest.fn(),
}));
test("saved search normalizes blank price limits to null and numeric strings to numbers", () => {
  const result = buildSavedSearchPayload({
    query: " blue jacket ",
    filters: { priceMin: "0", priceMax: "100" },
  });
  expect(result.query).toBe("blue jacket");
  expect(result.filters.priceMin).toBe(0);
  expect(result.filters.priceMax).toBe(100);
  expect(result.filters.gender).toEqual([]);
  expect(
    buildSavedSearchPayload({ query: "jacket" }).filters.priceMin,
  ).toBeNull();
});
test("malformed saved searches are rejected before writing", () => {
  for (const value of [
    { query: " " },
    { query: "jacket", sort: "invalid" },
    { query: "jacket", page: 0 },
    { query: "jacket", filters: { brand: [42] } },
    { query: "jacket", filters: { priceMin: 100, priceMax: 20 } },
    { query: "jacket", filters: { priceMin: false } },
  ]) {
    expect(() => buildSavedSearchPayload(value)).toThrow();
  }
});
test("saved products normalize canonical fields and preserve zero price", () => {
  const value = buildSavedItemPayload({
    name: " Jacket ",
    source: " ASOS ",
    productUrl: "https://example.com/p",
    numericPrice: "0",
    price: 0,
    userId: "forged",
    itemId: "123",
    raw: { secret: true },
  });
  expect(value.numericPrice).toBe(0);
  expect(value.price).toBe("0");
  expect(value.name).toBe("Jacket");
  expect(value.source).toBe("ASOS");
  expect(value).not.toHaveProperty("userId");
  expect(value).not.toHaveProperty("raw");
  expect(value).not.toHaveProperty("itemId");
});
test("saved products reject missing names and non-numeric price values", () => {
  for (const product of [
    { source: "ASOS", productUrl: "https://example.com/p" },
    {
      name: "Jacket",
      source: "ASOS",
      productUrl: "https://example.com/p",
      numericPrice: true,
    },
    {
      name: "Jacket",
      source: "ASOS",
      productUrl: "https://example.com/p",
      numericPrice: "Infinity",
    },
  ]) {
    expect(() => buildSavedItemPayload(product)).toThrow();
  }
});
test("saved product identity normalizes source casing and URL scheme", () => {
  const identity = buildSavedItemIdentity({
    source: " ASOS ",
    productUrl: "HTTPS://example.com/product#details",
  });
  expect(identity).toEqual(["asos", "https://example.com/product#details"]);
  expect(
    buildSavedItemIdentity({
      source: "asos",
      productUrl: "https://example.com/product#details",
    }),
  ).toEqual(identity);
});
test("unsafe URLs and invalid prices are rejected", () => {
  const invalidProducts = [
    // eslint-disable-next-line no-script-url -- Intentional unsafe URL used to test rejection.
    { name: "Jacket", productUrl: "javascript:alert(1)" },
    {
      name: "Jacket",
      productUrl: "https://example.com/p",
      numericPrice: NaN,
    },
    {
      name: "Jacket",
      productUrl: "https://example.com/p",
      numericPrice: -1,
    },
  ];

  for (const product of invalidProducts) {
    expect(() => buildSavedItemPayload(product)).toThrow();
  }
});
