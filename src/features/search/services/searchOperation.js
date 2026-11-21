export const normalizeSearchText = (query) =>
  String(query || "").normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

export const createSearchOperation = ({
  execute,
  createId = () => globalThis.crypto.randomUUID(),
}) => {
  let operation = null;
  let pending = null;

  const run = (action, payload) => {
    if (pending) return pending;
    let request;
    const previousOperation = operation;
    try {
      if (action === "new") {
        const query = normalizeSearchText(payload?.query);
        if (!query || query.length > 250) {
          throw new Error("Enter a search between 1 and 250 characters.");
        }
        operation = {
          requestId: createId(),
          payload: { ...payload, query },
        };
      } else {
        if (!operation) throw new Error("Submit a text search first.");
        if (action === "refine") {
          const next = { ...operation.payload, ...payload };
          if (normalizeSearchText(next.query) !== operation.payload.query) {
            throw new Error("Submit changed text as a new search.");
          }
          operation = {
            ...operation,
            payload: { ...next, query: operation.payload.query },
          };
        }
      }
      request = {
        ...operation.payload,
        requestId: operation.requestId,
        action,
      };
    } catch (error) {
      return Promise.reject(error);
    }
    pending = Promise.resolve()
      .then(() => execute(request))
      .catch((error) => {
        if (action === "new" && error?.details?.reason === "SEARCH_QUOTA_EXHAUSTED") {
          operation = previousOperation;
        }
        throw error;
      })
      .finally(() => { pending = null; });
    return pending;
  };

  return {
    submit: (payload) => run("new", payload),
    refine: (payload) => run("refine", payload),
    retry: () => run("retry"),
    current: () => operation && {
      requestId: operation.requestId,
      payload: JSON.parse(JSON.stringify(operation.payload)),
    },
  };
};
