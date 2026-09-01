const normalizeString = (value) =>
  String(value || '')
      .trim()
      .toLowerCase();

const includesKeyword = (text, keywords = []) =>
  keywords.some((keyword) => text.includes(keyword));

module.exports = {
  normalizeString,
  includesKeyword,
};
