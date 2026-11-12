import OnboardingFlow from "../components/OnboardingFlow";
export { femaleCategories, maleCategories } from "../utils/onboardingSchema";
export default function OnboardingCategoriesPage() {
  return <OnboardingFlow step={1} />;
}
