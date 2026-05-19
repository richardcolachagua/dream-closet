import axios from "axios";
import { normalizeCombinedResults, applyProductFilters } from "./filterResults";

const buildSearchQuery = (query, onboardingGender) => {
  if (!onboardingGender) return query;

  const normalizedGender = String(onboardingGender).toLowerCase();

  if (normalizedGender === "female") return `women ${query}`;
  if (normalizedGender === "male") return `men ${query}`;
  if (normalizedGender === "unisex") return `unisex ${query}`;

  return query;
};

export const searchAsos = async (query, onboardingGender) => {
  const finalQuery = buildSearchQuery(query, onboardingGender);

  const options = {
    method: "GET",
    url: "https://asos2.p.rapidapi.com/products/v2/list",
    params: {
      store: "US",
      offset: "0",
      categoryId: "4209",
      limit: "48",
      country: "US",
      sort: "freshness",
      q: finalQuery,
      currency: "USD",
      sizeSchema: "US",
      lang: "en-US",
    },
    headers: {
      "x-rapidapi-key": "YOUR_KEY",
      "x-rapidapi-host": "asos2.p.rapidapi.com",
    },
  };

  const response = await axios.request(options);
  return response.data?.products || [];
};

export const searchRealTimeProducts = async (query, onboardingGender) => {
  const finalQuery = buildSearchQuery(query, onboardingGender);

  const options = {
    method: "GET",
    url: "https://real-time-product-search.p.rapidapi.com/search-v2",
    params: {
      q: finalQuery,
      country: "us",
      language: "en",
      page: "1",
      limit: "10",
      sort_by: "BEST_MATCH",
      product_condition: "ANY",
      min_rating: "ANY",
      return_filters: "true",
    },
    headers: {
      "x-rapidapi-key": "YOUR_KEY",
      "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
    },
  };

  const response = await axios.request(options);
  return response.data?.data?.products || [];
};

export const fetchCombinedResults = async ({
  query,
  filters = {},
  onboardingGender = "",
}) => {
  const [asosResults, realTimeResults] = await Promise.all([
    searchAsos(query, onboardingGender),
    searchRealTimeProducts(query, onboardingGender),
  ]);

  const normalizedResults = normalizeCombinedResults(
    asosResults,
    realTimeResults,
  );

  return applyProductFilters(normalizedResults, filters);
};
