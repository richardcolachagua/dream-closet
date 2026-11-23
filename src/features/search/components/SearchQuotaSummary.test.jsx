import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchQuotaSummary, { formatQuotaReset } from "./SearchQuotaSummary";

const mount = (props = {}) => render(
  <MemoryRouter><SearchQuotaSummary {...props} /></MemoryRouter>
);

test("loading does not invent an allowance", () => {
  mount({ loading: true });
  expect(screen.getByRole("status").textContent).toContain("Checking");
});
test("missing quota is shown as unavailable", () => {
  mount();
  expect(screen.getByRole("status").textContent).toContain("unavailable");
});
test("visitor exhaustion preserves the explanation for existing searches", () => {
  mount({ quota: { tier: "visitor", remaining: 0, limit: 3 }, canRefine: true });
  expect(screen.getByRole("status").textContent).toContain("0 of 3");
  expect(screen.getByText("You can still filter, sort, or retry your current search.")).toBeTruthy();
});
test("exhaustion without a current reservation does not promise refinements", () => {
  mount({ quota: { tier: "visitor", remaining: 0, limit: 3 } });
  expect(screen.queryByText("You can still filter, sort, or retry your current search.")).toBeNull();
  expect(screen.getByText(/Wait for your allowance/)).toBeTruthy();
});
test("visitor signup links use the canonical route", () => {
  mount();
  expect(screen.getByRole("link", { name: "Create free account" }).getAttribute("href")).toBe("/signuppage");
});
test("Pro is not displayed as zero searches remaining", () => {
  mount({ registered: true, quota: { tier: "pro", unlimited: true, remaining: null } });
  expect(screen.getByRole("status").textContent).toContain("Unlimited");
  expect(screen.queryByRole("link", { name: "Create free account" })).toBeNull();
});
test("Free reset formatting uses New York time", () => {
  const value = formatQuotaReset({ tier: "free", resetAt: "2026-11-21T05:00:00.000Z" });
  expect(value.value).toContain("Nov 21");
  expect(value.value).toContain("12:00");
});
test("invalid reset times are omitted", () => {
  expect(formatQuotaReset({ tier: "visitor", resetAt: "bad-date" })).toBeNull();
  expect(formatQuotaReset({})).toBeNull();
});
