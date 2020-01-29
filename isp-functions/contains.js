// Partially borrowed from:
// https://github.com/stoplightio/spectral/blob/develop/src/functions/pattern.ts
function getRe(regex) {
  let re;
  if (typeof regex === 'string') {
    // regex in a string like {"match": "/[a-b]+/im"} or {"match": "[a-b]+"} in a json ruleset
    // the available flags are "gimsuy" as described here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    const splitRegex = /^\/(.+)\/([a-z]*)$/.exec(regex);
    if (splitRegex) {
      // with slashes like /[a-b]+/ and possibly with flags like /[a-b]+/im
      re = new RegExp(splitRegex[1], splitRegex[2]);
    } else {
      // without slashes like [a-b]+
      re = new RegExp(regex);
    }
  } else {
    // true regex
    re = new RegExp(regex);
  }
  return re;
}

// Contains function takes an array or object along with a `match` option and
// fails if the match cannot be found in any of the items (or object keys).
module.exports = (targetValue, options) => {
  let found = false;
  const re = getRe(options.match);

  // Either the value is an array or an object, in which case we take the keys.
  let items = targetValue;
  if (!Array.isArray(items)) {
    items = Object.keys(items);
  }

  // Go through each item in the array and look for a match.
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
};
