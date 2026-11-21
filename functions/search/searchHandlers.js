const {HttpsError} = require('firebase-functions/v1/https');
const {identityFromAuth} = require('./quota/searchQuotaService');
const {
  validateSearchRequest,
  validateQuotaRequest,
} = require('./utils/searchValidation');

const createSearchHandlers = ({
  executionService,
  quotaService,
  logger = console,
}) => {
  if (
    typeof executionService?.runSearch !== 'function' ||
    typeof quotaService?.getSearchQuota !== 'function'
  ) {
    throw new TypeError('Search execution and quota services are required.');
  }

  const safely = async (operation, operationName) => {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Search handler failed:', {
        operation: operationName,
        message: error?.message,
      });

      throw new HttpsError('internal', 'Search is temporarily unavailable.', {
        reason: 'SEARCH_INTERNAL_ERROR',
      });
    }
  };

  const searchProducts = async (data, context) =>
    safely(async () => {
      identityFromAuth(context?.auth);

      const request = validateSearchRequest(data);

      return executionService.runSearch({
        auth: context.auth,
        ...request,
      });
    }, 'searchProducts');

  const checkSearchLimit = async (data, context) =>
    safely(async () => {
      identityFromAuth(context?.auth);
      validateQuotaRequest(data);

      return quotaService.getSearchQuota({
        auth: context.auth,
      });
    }, 'checkSearchLimit');

  return {
    searchProducts,
    checkSearchLimit,
  };
};

module.exports = {
  createSearchHandlers,
};
