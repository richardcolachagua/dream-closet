const axios = require("axios");
const AWS = require("aws-sdk");

AWS.config.update({ region: "your-region" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const API_KEY = "your-rapidapi-key";
const API_HOST = "asos2.p.rapidapi.com";

exports.search = async (req, res) => {
  try {
    const { query } = req.query;
    const options = {
      method: "GET",
      url: "https://asos2.p.rapidapi.com/products/v2/list",
      params: {
        store: "US",
        offset: "0",
        categoryId: "4209", // This is for women's dresses. You might want to make this dynamic based on the search query
        country: "US",
        sort: "freshness",
        currency: "USD",
        sizeSchema: "US",
        limit: "48",
        lang: "en-US",
        q: query, // Add the search query here
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

    res.json(transformedResults);
  } catch (error) {
    console.error("Search error", error);
    res.status(500).json({ error: "An error occurred during search" });
  }
};
