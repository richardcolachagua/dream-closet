const sortProducts = (products = [], sort = 'relevance') => {
  const sorted = [...products];
  if (!['price_asc', 'price_desc'].includes(sort)) {
    return sorted;
  }
  return sorted.sort((a, b) => {
    const validA = Number.isFinite(a.numericPrice) && a.numericPrice >= 0;
    const validB = Number.isFinite(b.numericPrice) && b.numericPrice >= 0;
    if (validA !== validB) {
      return validA ? -1 : 1;
    }
    if (!validA) {
      return 0;
    }
    const currencyA = a.currency || '';
    const currencyB = b.currency || '';
    if (currencyA !== currencyB) {
      if (!currencyA || !currencyB) {
        return currencyA ? -1 : 1;
      }
      return currencyA < currencyB ? -1 : 1;
    }
    if (!currencyA) {
      return 0;
    }
    return (sort === 'price_asc' ? 1 : -1) * (a.numericPrice - b.numericPrice);
  });
};
module.exports = {sortProducts};
