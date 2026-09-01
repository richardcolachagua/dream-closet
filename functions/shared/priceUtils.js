const parsePriceValue = (price) => {
  if (typeof price === 'number') {
    return price;
  }

  if (!price || typeof price !== 'string') {
    return null;
  }

  const normalized = price.replace(/,/g, '');
  const match = normalized.match(/\d+(?:\.\d+)?/);

  return match ? Number(match[0]) : null;
};

module.exports = {
  parsePriceValue,
};
