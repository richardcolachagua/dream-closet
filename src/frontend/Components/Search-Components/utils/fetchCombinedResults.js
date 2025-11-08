import axios from "axios";

export const searchAsos = async (query) => {
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
      q: query,
      currency: "USD",
      sizeSchema: "US",
      lang: "en-US",
    },
    headers: {
      "x-rapidapi-key": "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
      "x-rapidapi-host": "asos2.p.rapidapi.com",
    },
  };
  const response = await axios.request(options);
  return response.data.products;
};

export const searchRealTimeProducts = async (query) => {
  const options = {
    method: "GET",
    url: "https://real-time-product-search.p.rapidapi.com/search-v2",
    params: {
      q: query,
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
      "x-rapidapi-key": "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
      "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
    },
  };
  const response = await axios.request(options);
  return response.data?.data?.products || [];
};

export const fetchCombinedResults = async (query) => {
  const [asosResults, realTimeResults] = await Promise.all([
    searchAsos(query),
    searchRealTimeProducts(query),
  ]);
  return [
    ...(Array.isArray(asosResults) ? asosResults : []).map((product) => ({
      itemId: product.id,
      name: product.name,
      price: product.price?.current?.text || "Price unavailable",
      imageUrl: product.imageUrl ? `https://${product.imageUrl}` : "",
      productUrl: product.url ? `https://www.asos.com/${product.url}` : "",
      source: "ASOS",
    })),
    ...(Array.isArray(realTimeResults) ? realTimeResults : []).map(
      (product) => ({
        itemId: product.product_id,
        name: product.product_title,
        price: product.offer?.price || "Price unavailable",
        imageUrl: product.product_photos?.[0] || "",
        productUrl: product.offer?.offer_page_url || "",
        source: product.offer?.store_name || "Unknown",
      })
    ),
  ];
};
