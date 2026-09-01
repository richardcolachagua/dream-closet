const functions = require('firebase-functions');

const getRapidApiKey = () => {
  const config = functions.config ? functions.config() : {};

  const key = process.env.RAPIDAPI_KEY || config?.rapidapi?.key || '';

  if (!key) {
    throw new Error('Missing RapidAPI key.');
  }

  return key;
};

module.exports = {
  getRapidApiKey,
};
