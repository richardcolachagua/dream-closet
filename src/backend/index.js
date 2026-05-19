const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const db = admin.firestore();

const CATEGORY_KEYWORDS = {
  outerwear: [
    "jacket",
    "coat",
    "blazer",
    "parka",
    "trench",
    "puffer",
    "bomber",
    "windbreaker",
  ],
  tops: [
    "top",
    "shirt",
    "t-shirt",
    "tee",
    "blouse",
    "tank",
    "camisole",
    "sweater",
    "hoodie",
    "cardigan",
    "knit",
    "polo",
  ],
  bottoms: [
    "jeans",
    "pants",
    "trousers",
    "leggings",
    "joggers",
    "shorts",
    "skirt",
  ],
  dresses: ["dress", "gown", "maxi dress", "mini dress", "midi dress"],
  shoes: [
    "shoe",
    "sneaker",
    "boot",
    "heel",
    "loafer",
    "sandal",
    "trainer",
    "slipper",
  ],
  accessories: [
    "bag",
    "purse",
    "belt",
    "hat",
    "cap",
    "scarf",
    "jewelry",
    "necklace",
    "earrings",
    "bracelet",
    "watch",
    "sunglasses",
  ],
  activewear: [
    "legging",
    "sports bra",
    "track pants",
    "running",
    "gym",
    "activewear",
    "workout",
  ],
  swimwear: [
    "swimsuit",
    "bikini",
    "one-piece",
    "swim",
    "trunks",
    "boardshorts",
  ],
  loungewear: [
    "loungewear",
    "pajama",
    "robe",
    "sweatpants",
    "sweatshirt",
    "sleepwear",
  ],
};

const COLOR_KEYWORDS = {
  black: ["black", "jet black", "charcoal black"],
  white: ["white", "ivory", "off-white", "cream"],
  gray: ["gray", "grey", "charcoal", "heather gray"],
  beige: ["beige", "tan", "sand", "camel", "stone", "nude"],
  brown: ["brown", "chocolate", "mocha", "espresso", "taupe"],
  blue: ["blue", "cobalt", "sky blue", "baby blue", "royal blue"],
  navy: ["navy", "midnight navy"],
  green: ["green", "emerald", "mint", "sage", "forest"],
  olive: ["olive", "khaki", "army green"],
  yellow: ["yellow", "mustard"],
  orange: ["orange", "rust", "terracotta", "burnt orange"],
  red: ["red", "crimson", "burgundy", "maroon", "wine"],
  pink: ["pink", "rose", "blush", "fuchsia", "hot pink"],
  purple: ["purple", "lavender", "lilac", "violet", "plum"],
  gold: ["gold"],
  silver: ["silver"],
  multi: ["multi", "multicolor", "rainbow", "printed", "patterned"],
};

const GENDER_KEYWORDS = {
  female: ["women", "woman", "womens", "female", "ladies", "girl", "girls"],
  male: ["men", "man", "mens", "male", "boys", "boy"],
  unisex: ["unisex"],
};

function validateProfileData(data) {
  const errors = [];
  if (
    data.firstName &&
    (typeof data.firstName !== "string" ||
      data.firstName.length < 1 ||
      data.firstName.length > 50)
  ) {
    errors.push("Invalid first name");
  }
  if (
    data.lastName &&
    (typeof data.lastName !== "string" ||
      data.lastName.length < 1 ||
      data.lastName.length > 50)
  ) {
    errors.push("Invalid last name");
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email address");
  }
  if (data.newPassword && typeof data.newPassword !== "string") {
    errors.push("Password must be a string");
  }
  return errors;
}

function isRecentlyAuthenticated(context) {
  const FIVE_MINUTES = 5 * 60;
  const now = Math.floor(Date.now() / 1000);
  const authTime = context.auth.token.auth_time;
  return now - authTime < FIVE_MINUTES;
}

function normalizeString(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function includesKeyword(text, keywords = []) {
  return keywords.some((keyword) => text.includes(keyword));
}

function parsePriceValue(price) {
  if (typeof price === "number") return price;
  if (!price || typeof price !== "string") return null;
  const normalized = price.replace(/,/g, "");
  const match = normalized.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function inferCategory(productName = "") {
  const normalizedName = normalizeString(productName);
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (includesKeyword(normalizedName, keywords)) return category;
  }
  return "unknown";
}

function inferColors(productName = "") {
  const normalizedName = normalizeString(productName);
  const matches = [];
  for (const [color, keywords] of Object.entries(COLOR_KEYWORDS)) {
    if (includesKeyword(normalizedName, keywords)) matches.push(color);
  }
  return matches;
}

function inferGender(productName = "") {
  const normalizedName = normalizeString(productName);
  for (const [gender, keywords] of Object.entries(GENDER_KEYWORDS)) {
    if (includesKeyword(normalizedName, keywords)) return gender;
  }
  return "unknown";
}

function inferAvailability(product = {}) {
  if (typeof product?.inStock === "boolean") {
    return product.inStock ? "instock" : "outofstock";
  }
  const normalizedAvailability = normalizeString(product?.availability);
  if (
    normalizedAvailability.includes("in stock") ||
    normalizedAvailability.includes("available")
  ) {
    return "instock";
  }
  if (
    normalizedAvailability.includes("out of stock") ||
    normalizedAvailability.includes("unavailable") ||
    normalizedAvailability.includes("sold out")
  ) {
    return "outofstock";
  }
  return "unknown";
}

function inferBrand(product = {}, fallbackSource = "Unknown") {
  return (
    product?.brandName ||
    product?.brand ||
    product?.offer?.store_name ||
    product?.offer?.storeName ||
    fallbackSource
  );
}

function buildSearchQuery(query, gender) {
  if (!gender) return query;
  const normalizedGender = normalizeString(gender);
  if (normalizedGender === "female") return `women ${query}`;
  if (normalizedGender === "male") return `men ${query}`;
  if (normalizedGender === "unisex") return `unisex ${query}`;
  return query;
}

function mapSortForAsos(sort = "relevance") {
  switch (sort) {
    case "price_asc":
      return "priceasc";
    case "price_desc":
      return "pricedesc";
    case "newest":
      return "freshness";
    default:
      return "freshness";
  }
}

function mapSortForRealtime(sort = "relevance") {
  switch (sort) {
    case "price_asc":
      return "LOWEST_PRICE";
    case "price_desc":
      return "HIGHEST_PRICE";
    case "newest":
      return "NEWEST";
    default:
      return "BEST_MATCH";
  }
}

function getRapidApiKey() {
  const config = functions.config ? functions.config() : {};
  return process.env.RAPIDAPI_KEY || config?.rapidapi?.key || "";
}

async function searchAsos({
  query,
  gender,
  page = 1,
  pageSize = 24,
  sort = "relevance",
}) {
  const apiKey = getRapidApiKey();
  if (!apiKey) throw new Error("Missing RapidAPI key for ASOS search.");

  const finalQuery = buildSearchQuery(query, gender);
  const offset = Math.max(0, (Number(page) - 1) * Number(pageSize));

  const response = await axios.request({
    method: "GET",
    url: "https://asos2.p.rapidapi.com/products/v2/list",
    timeout: 9000,
    params: {
      store: "US",
      offset: String(offset),
      categoryId: "4209",
      limit: String(pageSize),
      country: "US",
      sort: mapSortForAsos(sort),
      q: finalQuery,
      currency: "USD",
      sizeSchema: "US",
      lang: "en-US",
    },
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "asos2.p.rapidapi.com",
    },
  });

  return response.data?.products || [];
}

async function searchRealTimeProducts({
  query,
  gender,
  page = 1,
  pageSize = 24,
  sort = "relevance",
}) {
  const apiKey = getRapidApiKey();
  if (!apiKey) throw new Error("Missing RapidAPI key for marketplace search.");

  const finalQuery = buildSearchQuery(query, gender);

  const response = await axios.request({
    method: "GET",
    url: "https://real-time-product-search.p.rapidapi.com/search-v2",
    timeout: 9000,
    params: {
      q: finalQuery,
      country: "us",
      language: "en",
      page: String(page),
      limit: String(pageSize),
      sort_by: mapSortForRealtime(sort),
      product_condition: "ANY",
      min_rating: "ANY",
      return_filters: "true",
    },
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
    },
  });

  return response.data?.data?.products || [];
}

function normalizeAsosProduct(product = {}) {
  const name = product?.name || "";
  const numericPrice =
    product?.price?.current?.value ??
    parsePriceValue(product?.price?.current?.text);

  return {
    itemId: product?.id || null,
    name,
    title: name,
    price: product?.price?.current?.text || "Price unavailable",
    numericPrice,
    currency: "USD",
    imageUrl: product?.imageUrl ? `https://${product.imageUrl}` : "",
    productUrl: product?.url ? `https://www.asos.com${product.url}` : "",
    source: "ASOS",
    brand: inferBrand(product, "ASOS"),
    gender: inferGender(name),
    category: inferCategory(name),
    subcategory: "",
    size: [],
    color: inferColors(name),
    material: "",
    availability: inferAvailability(product),
    rawData: product,
  };
}

function normalizeRealtimeProduct(product = {}) {
  const name = product?.product_title || product?.productTitle || "";
  const rawPrice = product?.offer?.price || "Price unavailable";
  const source =
    product?.offer?.store_name || product?.offer?.storeName || "Unknown";

  return {
    itemId: product?.product_id || product?.productId || null,
    name,
    title: name,
    price: rawPrice,
    numericPrice: parsePriceValue(rawPrice),
    currency: "USD",
    imageUrl: product?.product_photos?.[0] || product?.productPhotos?.[0] || "",
    productUrl:
      product?.offer?.offer_page_url || product?.offer?.offerPageUrl || "",
    source,
    brand: inferBrand(product, source),
    gender: inferGender(name),
    category: inferCategory(name),
    subcategory: "",
    size: [],
    color: inferColors(name),
    material: "",
    availability: inferAvailability(product),
    rawData: product,
  };
}

function normalizeCombinedResults(asosResults = [], realTimeResults = []) {
  return [
    ...(Array.isArray(asosResults)
      ? asosResults.map(normalizeAsosProduct)
      : []),
    ...(Array.isArray(realTimeResults)
      ? realTimeResults.map(normalizeRealtimeProduct)
      : []),
  ];
}

function matchesArrayFilter(productValue, selectedValues = []) {
  if (!selectedValues.length) return true;
  if (Array.isArray(productValue)) {
    return productValue.some((value) =>
      selectedValues.includes(normalizeString(value)),
    );
  }
  return selectedValues.includes(normalizeString(productValue));
}

function matchesPriceFilter(numericPrice, priceMin, priceMax) {
  if (!priceMin && !priceMax) return true;
  if (numericPrice === null || numericPrice === undefined) return false;

  const min = priceMin !== "" ? Number(priceMin) : null;
  const max = priceMax !== "" ? Number(priceMax) : null;

  if (min !== null && numericPrice < min) return false;
  if (max !== null && numericPrice > max) return false;
  return true;
}

function matchesBrandFilter(brand, selectedBrands = []) {
  if (!selectedBrands.length) return true;
  const normalizedBrand = normalizeString(brand);
  if (!normalizedBrand) return false;

  return selectedBrands.some((selectedBrand) => {
    const normalizedSelectedBrand = normalizeString(selectedBrand);
    return (
      normalizedBrand.includes(normalizedSelectedBrand) ||
      normalizedSelectedBrand.includes(normalizedBrand)
    );
  });
}

function applyProductFilters(products = [], filters = {}) {
  const normalizedFilters = {
    gender: (filters.gender || []).map(normalizeString),
    category: (filters.category || []).map(normalizeString),
    size: (filters.size || []).map(normalizeString),
    color: (filters.color || []).map(normalizeString),
    brand: (filters.brand || []).map(normalizeString),
    store: (filters.store || []).map(normalizeString),
    availability: (filters.availability || []).map(normalizeString),
    priceMin: filters.priceMin ?? "",
    priceMax: filters.priceMax ?? "",
  };

  return products.filter((product) => {
    const matchesGender = matchesArrayFilter(
      product.gender,
      normalizedFilters.gender,
    );
    const matchesCategory = matchesArrayFilter(
      product.category,
      normalizedFilters.category,
    );
    const matchesSize = !normalizedFilters.size.length
      ? true
      : Array.isArray(product.size) && product.size.length > 0
        ? matchesArrayFilter(product.size, normalizedFilters.size)
        : true;
    const matchesColor = matchesArrayFilter(
      product.color,
      normalizedFilters.color,
    );
    const matchesAvailability = matchesArrayFilter(
      product.availability,
      normalizedFilters.availability,
    );
    const matchesStore = matchesArrayFilter(
      product.source,
      normalizedFilters.store,
    );
    const matchesBrand = matchesBrandFilter(
      product.brand,
      normalizedFilters.brand,
    );
    const matchesPrice = matchesPriceFilter(
      product.numericPrice,
      normalizedFilters.priceMin,
      normalizedFilters.priceMax,
    );

    return (
      matchesGender &&
      matchesCategory &&
      matchesSize &&
      matchesColor &&
      matchesAvailability &&
      matchesStore &&
      matchesBrand &&
      matchesPrice
    );
  });
}

function dedupeProducts(products = []) {
  const seen = new Set();

  return products.filter((product) => {
    const key =
      normalizeString(product.itemId) ||
      normalizeString(product.productUrl) ||
      `${normalizeString(product.source)}::${normalizeString(product.name)}`;

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortProducts(products = [], sort = "relevance") {
  const sorted = [...products];

  if (sort === "price_asc") {
    sorted.sort(
      (a, b) =>
        (a.numericPrice ?? Number.POSITIVE_INFINITY) -
        (b.numericPrice ?? Number.POSITIVE_INFINITY),
    );
  } else if (sort === "price_desc") {
    sorted.sort(
      (a, b) =>
        (b.numericPrice ?? Number.NEGATIVE_INFINITY) -
        (a.numericPrice ?? Number.NEGATIVE_INFINITY),
    );
  }

  return sorted;
}

function validateSearchPayload(data = {}) {
  const query = typeof data.query === "string" ? data.query.trim() : "";

  if (!query) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Query is required.",
    );
  }

  return {
    query,
    gender: typeof data.gender === "string" ? data.gender : "",
    filters:
      typeof data.filters === "object" && data.filters ? data.filters : {},
    sort: typeof data.sort === "string" ? data.sort : "relevance",
    page: Number.isFinite(Number(data.page))
      ? Math.max(1, Number(data.page))
      : 1,
    pageSize: Number.isFinite(Number(data.pageSize))
      ? Math.min(48, Math.max(1, Number(data.pageSize)))
      : 24,
  };
}

async function performSearch({
  query,
  gender = "",
  filters = {},
  sort = "relevance",
  page = 1,
  pageSize = 24,
}) {
  const providerCalls = await Promise.allSettled([
    searchAsos({ query, gender, page, pageSize, sort }),
    searchRealTimeProducts({ query, gender, page, pageSize, sort }),
  ]);

  const asosResults =
    providerCalls[0].status === "fulfilled" ? providerCalls[0].value : [];
  const realtimeResults =
    providerCalls[1].status === "fulfilled" ? providerCalls[1].value : [];

  const warnings = [];
  if (providerCalls[0].status === "rejected")
    warnings.push("ASOS search unavailable");
  if (providerCalls[1].status === "rejected")
    warnings.push("Marketplace search unavailable");

  const normalizedResults = normalizeCombinedResults(
    asosResults,
    realtimeResults,
  );
  const dedupedResults = dedupeProducts(normalizedResults);
  const filteredResults = applyProductFilters(dedupedResults, filters);
  const sortedResults = sortProducts(filteredResults, sort);
  const startIndex = Math.max(0, (Number(page) - 1) * Number(pageSize));
  const endIndex = startIndex + Number(pageSize);
  const pagedResults = sortedResults.slice(startIndex, endIndex);

  return {
    results: sortedResults,
    total: sortedResults.length,
    page: Number(page),
    pageSize: Number(pageSize),
    hasMore: sortedResults.length === Number(pageSize),
    warnings,
    sources: {
      asos: asosResults.length,
      realtime: realtimeResults.length,
    },
  };
}

exports.checkSearchLimit = functions.https.onCall(async () => {
  return {
    remainingSearches: 3,
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
});

exports.searchProducts = functions.https.onCall(async (data) => {
  const payload = validateSearchPayload(data);

  try {
    return await performSearch(payload);
  } catch (error) {
    console.error("Error searching products:", error);
    throw new functions.https.HttpsError(
      "internal",
      error?.message || "Search failed.",
    );
  }
});

exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to update profile",
    );
  }

  const validationErrors = validateProfileData(data);
  if (validationErrors.length > 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      validationErrors.join(", "),
    );
  }

  if ((data.email || data.newPassword) && !isRecentlyAuthenticated(context)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Recent authentication required for sensitive updates.",
    );
  }

  const uid = context.auth.uid;
  const { firstName, lastName, email, newPassword } = data;

  try {
    const authUpdates = {};
    if (typeof firstName === "string" && typeof lastName === "string") {
      authUpdates.displayName = `${firstName} ${lastName}`.trim();
    }
    if (typeof email === "string") {
      authUpdates.email = email;
    }
    if (typeof newPassword === "string") {
      authUpdates.password = newPassword;
    }

    if (Object.keys(authUpdates).length > 0) {
      await admin.auth().updateUser(uid, authUpdates);
    }

    const firestoreUpdates = {};
    if (typeof firstName === "string") firestoreUpdates.firstName = firstName;
    if (typeof lastName === "string") firestoreUpdates.lastName = lastName;
    if (typeof email === "string") firestoreUpdates.email = email;

    if (Object.keys(firestoreUpdates).length > 0) {
      await db
        .collection("users")
        .doc(uid)
        .set(firestoreUpdates, { merge: true });
    }

    console.log(`User profile updated for UID: ${uid}`, {
      updates: { authUpdates, firestoreUpdates },
    });

    return { message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occured while updating the profile",
    );
  }
});
