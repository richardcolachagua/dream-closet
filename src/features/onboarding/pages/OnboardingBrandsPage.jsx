import OnboardingFlow from "../components/OnboardingFlow";
export { buildBrandGroupsForGender } from "../utils/onboardingSchema";
export default function OnboardingBrandsPage() {
  return <OnboardingFlow step={2} />;
}
