import { buildSavedSearchPayload } from "./savedDataService";
import { buildSavedItemPayload } from "../search/utils/buildSavedItemPayload";
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
test("saved products omit provider and ownership fields and preserve zero price", () => {
  const value = buildSavedItemPayload({
    name: "Jacket",
    source: "ASOS",
    productUrl: "https://example.com/p",
    numericPrice: 0,
    price: 0,
    userId: "forged",
    itemId: "123",
    raw: { secret: true },
  });
  expect(value.numericPrice).toBe(0);
  expect(value.price).toBe("0");
  expect(value).not.toHaveProperty("userId");
  expect(value).not.toHaveProperty("raw");
  expect(value).not.toHaveProperty("itemId");
});
test("unsafe URLs and invalid prices are rejected", () => {
  const invalidProducts = [
    // eslint-disable-next-line no-script-url -- Intentional unsafe URL used to test rejection.
    { productUrl: "javascript:alert(1)" },
    {
      productUrl: "https://example.com/p",
      numericPrice: NaN,
    },
    {
      productUrl: "https://example.com/p",
      numericPrice: -1,
    },
  ];

  for (const product of invalidProducts) {
    expect(() => buildSavedItemPayload(product)).toThrow();
  }
});
