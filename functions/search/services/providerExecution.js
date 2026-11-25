const PROVIDER_TIMEOUT_MS = 9000;
const SEARCH_BUDGET_MS = 10000;

const providerError = (code) => {
  const error = new Error('Search provider could not complete the request.');
  error.code = code;
  return error;
};

const requireProductArray = (value) => {
  if (!Array.isArray(value)) {
    throw providerError('PROVIDER_RESPONSE_INVALID');
  }
  return value;
};

const classifyFailure = (error) => {
  switch (error?.code) {
    case 'PROVIDER_TIMEOUT':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
      return 'timeout';
    case 'ERR_CANCELED':
      return 'cancelled';
    case 'PROVIDER_RESPONSE_INVALID':
      return 'malformed_response';
    case 'PROVIDER_DATA_INVALID':
      return 'unusable_records';
    case 'PROVIDER_CONFIGURATION':
      return 'configuration_error';
    default:
      return 'upstream_error';
  }
};

const runProvider = async ({
  name,
  search,
  normalize,
  request,
  deadlineAt,
}) => {
  const startedAt = Date.now();
  const controller = new AbortController();
  const remainingMs = Math.max(
      0,
      Math.min(SEARCH_BUDGET_MS, deadlineAt - startedAt),
  );
  let timer;
  let receivedCount = 0;
  let normalizedCount = 0;
  const health = (outcome, error) => {
    const status = error?.response?.status;
    return {
      provider: name,
      outcome,
      durationMs: Math.max(0, Date.now() - startedAt),
      httpStatus:
        Number.isInteger(status) && status >= 400 && status <= 599 ?
          status :
          null,
      receivedCount,
      normalizedCount,
      rejectedCount: Math.max(0, receivedCount - normalizedCount),
    };
  };
  try {
    if (!remainingMs) {
      throw providerError('PROVIDER_TIMEOUT');
    }
    const timeout = new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        // Settle the deadline before signalling the transport to abort.
        reject(providerError('PROVIDER_TIMEOUT'));
        controller.abort();
      }, remainingMs);
    });
    const operation = Promise.resolve().then(async () => {
      const raw = requireProductArray(
          await search({
            ...request,
            signal: controller.signal,
          }),
      );
      if (controller.signal.aborted) {
        throw providerError('PROVIDER_TIMEOUT');
      }
      receivedCount = raw.length;
      const products = normalize(raw);
      if (!Array.isArray(products)) {
        throw providerError('PROVIDER_DATA_INVALID');
      }
      normalizedCount = products.length;
      if (raw.length && !products.length) {
        throw providerError('PROVIDER_DATA_INVALID');
      }
      return products;
    });
    const value = await Promise.race([operation, timeout]);
    return {
      status: 'fulfilled',
      value,
      receivedCount,
      health: health(value.length ? 'success' : 'empty'),
    };
  } catch (error) {
    return {
      status: 'rejected',
      value: [],
      receivedCount,
      health: health(classifyFailure(error), error),
    };
  } finally {
    clearTimeout(timer);
  }
};

module.exports = {
  PROVIDER_TIMEOUT_MS,
  SEARCH_BUDGET_MS,
  providerError,
  requireProductArray,
  runProvider,
};
