const searchAppCheckEnforced = (env = process.env) => {
  const value = env.SEARCH_ENFORCE_APP_CHECK;
  if (value !== undefined && value !== 'true' && value !== 'false') {
    throw new Error('SEARCH_ENFORCE_APP_CHECK must be true or false.');
  }
  if (env.FUNCTIONS_EMULATOR === 'true') return false;
  return value === 'true';
};
module.exports = {searchAppCheckEnforced};
