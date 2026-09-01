const validateProfileData = (data = {}) => {
  const errors = [];

  if (
    data.firstName &&
    (typeof data.firstName !== 'string' ||
      data.firstName.trim().length < 1 ||
      data.firstName.trim().length > 50)
  ) {
    errors.push('Invalid first name.');
  }

  if (
    data.lastName &&
    (typeof data.lastName !== 'string' ||
      data.lastName.trim().length < 1 ||
      data.lastName.trim().length > 50)
  ) {
    errors.push('Invalid last name.');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email address.');
  }

  return errors;
};

const isRecentlyAuthenticated = (context) => {
  const authTime = Number(context.auth?.token?.auth_time || 0);
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  return Boolean(authTime) && now - authTime < fiveMinutes;
};

module.exports = {
  validateProfileData,
  isRecentlyAuthenticated,
};
