const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to update profile"
    );
  }

  const uid = context.auth.uid;
  const { firstName, lastName, email, newPassword } = data;

  try {
    // Update user profile in Firebase Auth
    const updatePromises = [];

    if (firstName || lastName) {
      updatePromises.push(
        admin.auth().updateUser(uid, {
          displayName: `${firstName} ${lastName}`.trim(),
        })
      );
    }

    if (email) {
      updatePromises.push(admin.auth().updateUser(uid, { email }));
    }

    if (newPassword) {
      updatePromises.push(
        admin.auth().updateUser(uid, { password: newPassword })
      );
    }

    await Promise.all(updatePromises);

    //Update user data in Firestore
    const userRef = admin.firestore().collection("users").doc(uid);
    await userRef.update({
      firstName,
      lastName,
      email,
    });

    return { message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while updating the profile"
    );
  }
})[1][2][4];

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
