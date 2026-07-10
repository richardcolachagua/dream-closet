export const SEARCH_API_URL = "/api/searchProducts";

const buildDefaultResponse = ({ page, pageSize }) => ({
  results: [],
  total: 0,
  page,
  pageSize,
  hasMore: false,
  warnings: [],
  sources: [],
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
    throw new Error(
      error?.message || "Unable to fetch search results right now.",
    );
  }
};

export default fetchCombinedResults;
