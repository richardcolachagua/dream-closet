import catalog from "../../../shared/data/profileCatalog.json";
import { FILTER_OPTIONS } from "../../search/utils/filterOptions";
import { validateOnboarding } from "./onboardingSchema";
test("saved filter rules catalog matches the filter drawer values", () => {
  for (const [key, values] of Object.entries(catalog.filters)) {
    expect(FILTER_OPTIONS[key].map((option) => option.value)).toEqual(values);
  }
});
test("onboarding rejects invalid catalog values and permits skipped brands", () => {
  expect(
    validateOnboarding({
      gender: "female",
      categories: ["Dresses"],
      brands: [],
      completed: true,
    }).completed,
  ).toBe(true);
  expect(() =>
    validateOnboarding({
      gender: "female",
      categories: ["Dresses"],
      brands: ["Amiri"],
      completed: true,
    }),
  ).toThrow();
});
