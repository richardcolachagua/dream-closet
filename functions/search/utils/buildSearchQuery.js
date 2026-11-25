const {
  normalizeString,
  includesKeyword,
} = require('../../shared/stringUtils');
const GENDER_KEYWORDS = require('../constants/genderKeywords');

const buildSearchQuery = (query, gender) => {
  const text =
    typeof query === 'string' ?
      query.normalize('NFKC').replace(/\s+/gu, ' ').trim() :
      '';
  if (!text) {
    return '';
  }
  const hasExplicitGender = Object.values(GENDER_KEYWORDS).some((keywords) =>
    includesKeyword(text, keywords),
  );
  if (hasExplicitGender) {
    // Explicit query wording wins. Never rewrite or contradict it.
    return text;
  }
  const prefixes = {female: 'women', male: 'men', unisex: 'unisex'};
  const selected = normalizeString(gender);
  const prefix = Object.hasOwn(prefixes, selected) ? prefixes[selected] : '';
  return prefix ? `${prefix} ${text}` : text;
};
module.exports = {buildSearchQuery};
