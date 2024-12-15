const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const db = admin.firestore();

exports.search = functions.https.onCall(async (data, context) => {
  const { query } = data;
  const API_KEY = "your-rapidapi-key";
  const API_HOST = "asos2.p.rapidapi.com";

  try {
    const options = {
      method: "GET",
      url: "https://asos2.p.rapidapi.com/products/v2/list",
      params: {
        store: "US",
        offset: "0",
        categoryId: "4209",
        country: "US",
        sort: "freshness",
        currency: "USD",
        sizeSchema: "US",
        limit: "48",
        lang: "en-US",
        q: query,
      },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST,
      },
    };
    const response = await axios.request(options);

    const transformedResults = response.data.products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.current.text,
      image: product.imageUrl,
    }));

    return transformedResults;
  } catch (error) {
    console.error("Search error", error);
    throw new functions.HttpsError(
      "internal",
      "An error occurred during search"
    );
  }
});

exports.saveItem = functions.https;
