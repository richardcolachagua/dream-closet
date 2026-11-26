const normalizeString = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }
  return String(value).normalize('NFKC').trim().toLowerCase();
};

const words = (value) => normalizeString(value)
    .replace(/['’]/gu, '').match(/[\p{L}\p{N}]+/gu) || [];

const includesKeyword = (text, keywords = []) => {
  const tokens = words(text);
  if (!Array.isArray(keywords)) {
    return false;
  }
  return keywords.some((keyword) => {
    const expected = words(keyword);
    return expected.length > 0 && tokens.some((_, start) =>
      expected.every((token, offset) => {
        const actual = tokens[start + offset];
        const plural = /(?:s|x|z|ch|sh)$/.test(token) ? `${token}es` : `${token}s`;
        return actual === token ||
          (offset === expected.length - 1 && actual === plural);
      }));
  });
};

module.exports = {normalizeString, includesKeyword};
