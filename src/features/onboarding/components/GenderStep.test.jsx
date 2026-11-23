import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import GenderStep from "./GenderStep";

test("selection cards expose their checked state", () => {
  render(<GenderStep selectedGender="male" />);
  expect(screen.getByRole("radio", { name: "Men’s sections" }).getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("radio", { name: "Women’s sections" }).getAttribute("aria-checked")).toBe("false");
});
test("choosing a card calls the existing selection contract", () => {
  const change = jest.fn();
  render(<GenderStep onChangeGender={change} />);
  fireEvent.click(screen.getByRole("radio", { name: "Men’s sections" }));
  expect(change).toHaveBeenCalledWith("male");
});
test("Continue is unavailable before a choice", () => {
  render(<GenderStep onNext={jest.fn()} />);
  expect(screen.getByRole("button", { name: "Continue" }).disabled).toBe(true);
});
test("loading disables both cards and the Continue action", () => {
  render(<GenderStep selectedGender="male" loading onNext={jest.fn()} />);
  expect(screen.getByRole("radio", { name: "Men’s sections" }).disabled).toBe(true);
  expect(screen.getByRole("button", { name: /Saving/ }).disabled).toBe(true);
});
test("arrow keys move focus and request the next selection", () => {
  const change = jest.fn();
  render(<GenderStep selectedGender="female" onChangeGender={change} />);
  fireEvent.keyDown(screen.getByRole("radio", { name: "Women’s sections" }), { key: "ArrowRight" });
  expect(change).toHaveBeenCalledWith("male");
  expect(screen.getByRole("radio", { name: "Men’s sections" })).toHaveFocus();
});
