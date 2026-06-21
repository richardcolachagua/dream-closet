const readEnv = (viteKey, craKey, fallback = "") => {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    viteKey in import.meta.env
  ) {
    return import.meta.env[viteKey];
  }

  if (typeof process !== "undefined" && process.env && craKey in process.env) {
    return process.env[craKey];
  }

  return fallback;
};

const API_BASE_URL = readEnv("VITE_API_URL", "REACT_APP_API_URL", "").replace(
  /\/$/,
  "",
);

const SEARCH_API_URL_FROM_ENV = readEnv(
  "VITE_SEARCH_API_URL",
  "REACT_APP_SEARCH_API_URL",
  "",
).trim();

export const SEARCH_API_URL =
  SEARCH_API_URL_FROM_ENV ||
  (API_BASE_URL ? `${API_BASE_URL}/searchProducts` : "") ||
  "http://127.0.0.1:5001/dream-closet-4d254/us-central1/searchProducts";

const buildDefaultResponse = ({ page, pageSize }) => ({
  results: [],
  total: 0,
  page,
  pageSize,
  hasMore: false,
  warnings: [],
  sources: {},
});

export const fetchCombinedResults = async ({
  query,
  filters = {},
  onboardingGender = "",
  sort = "relevance",
  page = 1,
  pageSize = 24,
}) => {
  try {
    console.log("Dream Closet search endpoint:", SEARCH_API_URL);

    const response = await fetch(SEARCH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          query,
          gender: onboardingGender,
          filters,
          sort,
          page,
          pageSize,
        },
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || "Unable to fetch search results.");
    }

    return json?.result || buildDefaultResponse({ page, pageSize });
  } catch (error) {
    console.error("Error fetching combined search results:", error);

    if (error instanceof TypeError) {
      throw new Error(
        `Search service is unavailable at ${SEARCH_API_URL}. Check your API URL or start the Firebase Functions emulator.`,
      );
    }

    throw new Error(
      error?.message || "Unable to fetch search results right now.",
    );
  }
};

export default fetchCombinedResults;
