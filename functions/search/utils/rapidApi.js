const getRapidApiKey = () => {
  const key = process.env.RAPIDAPI_KEY || '';

  if (!key) {
    throw new Error(
        'Missing RapidAPI key. Set RAPIDAPI_KEY in the Functions environment.',
    );
  }

  return key;
};

module.exports = {
  getRapidApiKey,
};
