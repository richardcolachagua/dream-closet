const getRapidApiKey = () => {
  const value = process.env.RAPIDAPI_KEY;
  const key = typeof value === 'string' ? value.trim() : '';
  if (!key || /\s/u.test(key)) {
    const error = new Error('Search provider credentials are not configured.');
    error.code = 'PROVIDER_CONFIGURATION';
    throw error;
  }
  return key;
};
module.exports = {getRapidApiKey};
