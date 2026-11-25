const mapSortForAsos = (sort = 'relevance') => {
  switch (sort) {
    case 'price_asc':
      return 'priceasc';
    case 'price_desc':
      return 'pricedesc';
    case 'newest':
      return 'freshness';
    default:
      // Omit sort: provider-default ordering, NOT verified relevance.
      return undefined;
  }
};
const mapSortForRealtime = (sort = 'relevance') => {
  switch (sort) {
    case 'price_asc':
      return 'LOWEST_PRICE';
    case 'price_desc':
      return 'HIGHEST_PRICE';
    case 'newest':
      return 'NEWEST';
    default:
      return 'BEST_MATCH';
  }
};
module.exports = {mapSortForAsos, mapSortForRealtime};
