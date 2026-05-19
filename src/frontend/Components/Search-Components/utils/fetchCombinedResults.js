import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../../backend/firebase";

const functions = getFunctions(app);
const searchProductsCallable = httpsCallable(functions, "searchProducts");

export const fetchCombinedResults = async ({
  query,
  filters = {},
  onboardingGender = "",
  sort = "relevance",
  page = 1,
  pageSize = 24,
}) => {
  try {
    const response = await searchProductsCallable({
      query,
      gender: onboardingGender,
      filters,
      sort,
      page,
      pageSize,
    });

    return (
      response?.data || {
        results: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        warnings: [],
        sources: {},
      }
    );
  } catch (error) {
    console.error("Error fetching combined search results:", error);

    throw new Error(
      error?.message || "Unable to fetch search results right now.",
    );
  }
};

export default fetchCombinedResults;
