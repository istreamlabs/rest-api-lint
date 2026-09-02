const { createRulesetFunction } = require('@stoplight/spectral-core');
const writeGood = require('write-good');

module.exports = createRulesetFunction(
  {
    input: { type: ['string', 'null'] },
    options: null
  },
  function english(targetValue) {
    const suggestions = writeGood(targetValue || '');

    if (!suggestions.length) {
      return;
    }

    return suggestions.map(s => ({
      message: s.reason
    }));
  }
);
