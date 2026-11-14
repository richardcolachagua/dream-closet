const normalizeName = (value) => value.replace(/\s+/g, ' ').trim();

const validateProfileData = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['Profile changes must be an object.'];
  }
  const keys = Object.keys(data);
  const errors = [];
  if (!keys.length) errors.push('Provide at least one name field.');
  if (keys.some((key) => !['firstName', 'lastName'].includes(key))) {
    errors.push(
        'Only firstName and lastName may be changed. Email changes are disabled.',
    );
  }
  for (const key of ['firstName', 'lastName']) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      (typeof data[key] !== 'string' || normalizeName(data[key]).length > 60)
    ) {
      errors.push(`Invalid ${key}; use a string of at most 60 characters.`);
    }
  }
  return errors;
};

const isRecentlyAuthenticated = (context) => {
  const value = context.auth?.token?.auth_time;
  if (typeof value !== 'number' || !Number.isFinite(value)) return false;
  const age = Math.floor(Date.now() / 1000) - value;
  return age >= 0 && age < 300;
};

module.exports = {
  normalizeName,
  validateProfileData,
  isRecentlyAuthenticated,
};
