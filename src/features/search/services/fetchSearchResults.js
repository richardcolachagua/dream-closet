export const fetchCombinedResults = async ({
  query,
  filters = {},
  onboardingGender = "",
  sort = "relevance",
  page = 1,
  pageSize = 24,
}) => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5001/dream-closet-4d254/us-central1/searchProducts",
      {
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
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || "Unable to fetch search results.");
    }

    return (
      json?.result || {
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
