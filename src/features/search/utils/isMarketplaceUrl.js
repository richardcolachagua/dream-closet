export const isMarketplaceUrl = (value) => {
  try {
    return /(^|\.)google\.[a-z.]+$/i.test(new URL(value).hostname);
  } catch {
    return false;
  }
};
