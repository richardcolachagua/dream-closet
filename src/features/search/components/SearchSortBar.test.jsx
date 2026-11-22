import { render, screen } from "@testing-library/react";
import SearchSortBar from "./SearchSortBar";
import "@testing-library/jest-dom";

test("provider windows show loaded count rather than a global total", () => {
  render(
    <SearchSortBar total={48} visibleCount={96} totalScope="provider-window" />,
  );
  expect(screen.getByText("96 results loaded")).toBeInTheDocument();
});

test("one loaded result uses singular wording", () => {
  render(
    <SearchSortBar total={1} visibleCount={1} totalScope="provider-window" />,
  );
  expect(screen.getByText("1 result loaded")).toBeInTheDocument();
});

test("existing known-total consumers retain their presentation", () => {
  render(<SearchSortBar total={50} visibleCount={24} />);
  expect(screen.getByText("24 of 50 results")).toBeInTheDocument();
});
