const sortProducts = (products = [], sort = 'relevance') => {
  const sorted = [...products];

  if (sort === 'price_asc') {
    sorted.sort(
        (a, b) =>
          (a.numericPrice ?? Number.POSITIVE_INFINITY) -
        (b.numericPrice ?? Number.POSITIVE_INFINITY),
    );
  }

  if (sort === 'price_desc') {
    sorted.sort(
        (a, b) =>
          (b.numericPrice ?? Number.NEGATIVE_INFINITY) -
        (a.numericPrice ?? Number.NEGATIVE_INFINITY),
    );
  }

  return sorted;
};

module.exports = {
  sortProducts,
};
