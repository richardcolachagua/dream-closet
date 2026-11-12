import catalog from "../../../shared/data/profileCatalog.json";

export const EMPTY_ONBOARDING = {
  gender: null,
  categories: [],
  brands: [],
  completed: false,
};
export const femaleCategories = catalog.categories.female;
export const maleCategories = catalog.categories.male;
export const categoriesForGender = (gender) => catalog.categories[gender] || [];
export const buildBrandGroupsForGender = (gender) => {
  if (!["female", "male"].includes(gender)) return [];
  return catalog.brandGroups.map((group) => ({
    title: group.title,
    brands: [...new Set([...group.shared, ...group[gender]])],
  }));
};
export const buildOnboardingState = (overrides = {}) => ({
  gender: overrides.gender ?? null,
  categories: Array.isArray(overrides.categories) ? overrides.categories : [],
  brands: Array.isArray(overrides.brands) ? overrides.brands : [],
  completed: overrides.completed === true,
});
export const validateOnboarding = (value) => {
  if (!["female", "male"].includes(value.gender)) {
    throw new Error("Please select how you shop.");
  }
  const categories = categoriesForGender(value.gender);
  const brands = buildBrandGroupsForGender(value.gender).flatMap(
    (g) => g.brands,
  );
  if (
    !Array.isArray(value.categories) ||
    value.categories.length > 60 ||
    new Set(value.categories).size !== value.categories.length ||
    value.categories.some((item) => !categories.includes(item))
  ) {
    throw new Error("Select valid, unique categories.");
  }
  if (
    !Array.isArray(value.brands) ||
    value.brands.length > 100 ||
    new Set(value.brands).size !== value.brands.length ||
    value.brands.some((item) => !brands.includes(item))
  ) {
    throw new Error("Select valid, unique brands.");
  }
  if (value.completed && value.categories.length === 0) {
    throw new Error("Select at least one category.");
  }
  return buildOnboardingState(value);
};
