import { useEffect, useState } from "react";
import { Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext";
import { ROUTES } from "../../../app/routes/routePaths";
import OnboardingLayout from "./OnboardingLayout";
import GenderStep from "./GenderStep";
import CategoryStep from "./CategoryStep";
import BrandStep from "./BrandStep";
import {
  buildOnboardingState,
  validateOnboarding,
  categoriesForGender,
  buildBrandGroupsForGender,
} from "../utils/onboardingSchema";

const STEP_PATHS = [
  ROUTES.ONBOARDING_GENDER,
  ROUTES.ONBOARDING_CATEGORIES,
  ROUTES.ONBOARDING_BRANDS,
];

function OnboardingStepEditor({ step, user, profile }) {
  const navigate = useNavigate();

  const [draft, setDraft] = useState(() =>
    buildOnboardingState(profile.onboarding),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onboarding = profile.onboarding;

    if (onboarding?.completed) {
      navigate(ROUTES.SEARCH, { replace: true });
      return;
    }

    if (step > 0 && !onboarding?.gender) {
      navigate(ROUTES.ONBOARDING_GENDER, {
        replace: true,
      });
      return;
    }

    if (step > 1 && !onboarding?.categories?.length) {
      navigate(ROUTES.ONBOARDING_CATEGORIES, {
        replace: true,
      });
    }
  }, [profile, step, navigate]);

  const toggleSelection = (key, value) => {
    if (busy) {
      return;
    }

    setDraft((previous) => {
      const selected = previous[key];

      return {
        ...previous,
        [key]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
  };

  const changeGender = (gender) => {
    if (busy) {
      return;
    }

    setDraft((previous) => {
      if (gender === previous.gender) {
        return previous;
      }

      return {
        gender,
        categories: [],
        brands: [],
        completed: false,
      };
    });
  };

  const save = async (skipBrands = false) => {
    if (busy) {
      return;
    }

    if (!user || user.isAnonymous) {
      setError("Please sign in to continue.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const nextOnboarding = validateOnboarding({
        ...draft,
        brands: skipBrands ? [] : draft.brands,
        completed: step === 2,
      });

      if (step > 0 && nextOnboarding.categories.length === 0) {
        throw new Error("Select at least one category.");
      }

      await updateDoc(doc(db, "users", user.uid), {
        onboarding: nextOnboarding,
        updatedAt: serverTimestamp(),
      });

      const destination = step === 2 ? ROUTES.SEARCH : STEP_PATHS[step + 1];

      navigate(destination, {
        replace: step === 2,
      });
    } catch (failure) {
      setError(failure.message || "Could not save your preferences.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={step}
      stepLabel={`Step ${step + 1} of 3`}
      title="Build your style profile"
      subtitle="Choose your shopping preferences to help personalize Dream Closet."
      helperText={
        step === 2
          ? "Favorite brands are optional. You can skip this step."
          : "You can update these preferences later."
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {step === 0 && (
        <GenderStep
          selectedGender={draft.gender || ""}
          loading={busy}
          onChangeGender={changeGender}
          onNext={() => save()}
        />
      )}

      {step === 1 && (
        <CategoryStep
          categories={categoriesForGender(draft.gender)}
          selectedCategories={draft.categories}
          onToggleCategory={(value) => toggleSelection("categories", value)}
          loading={busy}
          onBack={() => navigate(STEP_PATHS[0])}
          onNext={() => save()}
        />
      )}

      {step === 2 && (
        <BrandStep
          brandGroups={buildBrandGroupsForGender(draft.gender)}
          selectedBrands={draft.brands}
          onToggleBrand={(value) => toggleSelection("brands", value)}
          loading={busy}
          onBack={() => navigate(STEP_PATHS[1])}
          onFinish={() => save()}
          onSkip={() => save(true)}
        />
      )}
    </OnboardingLayout>
  );
}

export default function OnboardingFlow({ step }) {
  const { user, profile, loading, profileLoading, profileError } = useAuth();

  if (loading || profileLoading) {
    return <CircularProgress />;
  }

  if (profileError || !profile || !user || user.isAnonymous) {
    return (
      <Alert severity="error">
        Your profile could not be loaded. Please sign in again to continue.
      </Alert>
    );
  }

  return (
    <OnboardingStepEditor
      key={`${user.uid}:${step}`}
      step={step}
      user={user}
      profile={profile}
    />
  );
}
