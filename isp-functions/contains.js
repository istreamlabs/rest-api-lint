const { createRulesetFunction } = require('@stoplight/spectral-core');

// Partially borrowed from:
// https://github.com/stoplightio/spectral/blob/develop/src/functions/pattern.ts
function getRe(regex) {
  let re;
  if (typeof regex === 'string') {
    const splitRegex = /^\/(.+)\/([a-z]*)$/.exec(regex);
    if (splitRegex) {
      re = new RegExp(splitRegex[1], splitRegex[2]);
    } else {
      re = new RegExp(regex);
    }
  } else {
    re = new RegExp(regex);
  }
  return re;
}

module.exports = createRulesetFunction(
  {
    input: null,
    options: {
      type: 'object',
      additionalProperties: false,
      properties: {
        match: { type: 'string' }
      },
      required: ['match']
    }
  },
  function contains(targetValue, options) {
    let found = false;
    const re = getRe(options.match);

    if (targetValue == null) {
      return [
        {
          message: `${options.match} not found among ${targetValue}`
        }
      ];
    }

    let items = targetValue;
    if (!Array.isArray(items)) {
      items = Object.keys(items);
    }

    for (let i = 0; i < items.length; i++) {
      if (re.test(items[i])) {
        found = true;
        break;
      }
    }

    if (!found) {
      return [
        {
          message: `${options.match} not found among ${items}`
        }
      ];
    }
  }
);
