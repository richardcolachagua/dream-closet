const parsePriceValue = (value, {decimalSeparator = '.'} = {}) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }
  if (typeof value !== 'string' || !['.', ','].includes(decimalSeparator)) {
    return null;
  }
  let text = value.trim().replace(/\u00a0|\u202f/g, ' ');
  text = text.replace(/^(?:[A-Z]{3}\s*|[$€£¥]\s*)/, '')
      .replace(/(?:\s*[A-Z]{3}|\s*[$€£¥])$/, '').trim();
  const pattern = decimalSeparator === '.' ?
    /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/ :
    /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;
  if (!pattern.test(text)) {
    return null;
  }
  text = decimalSeparator === '.' ? text.replace(/,/g, '') :
    text.replace(/\./g, '').replace(',', '.');
  const number = Number(text);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

module.exports = {parsePriceValue};
