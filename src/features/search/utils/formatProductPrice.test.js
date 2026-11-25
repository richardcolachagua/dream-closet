import { formatProductPrice } from "./formatProductPrice";

test("formats zero with its verified currency", () => {
  expect(formatProductPrice({ numericPrice: 0, currency: "USD" })).toBe("$0.00");
});
test("does not invent USD for an unknown currency", () => {
  expect(formatProductPrice({ numericPrice: 25, currency: null }))
    .toBe("25 (currency unconfirmed)");
});
test("formats EUR separately from USD", () => {
  expect(formatProductPrice({ numericPrice: 25, currency: "EUR" }))
    .toContain("€");
});
test("keeps legacy price text when no numeric value exists", () => {
  expect(formatProductPrice({ price: "£12.00" })).toBe("£12.00");
});
