// Unfortunately Spectral doesn't support imports, so in order to use this
// file we firts need to bundle it. Run the following to build it:
//
//   $ npm run build
const writeGood = require('write-good');

module.exports = function(targetValue, option) {
  const suggestions = writeGood(targetValue || '');

  if (!suggestions.length) {
    return;
  }

  return suggestions.map(s => {
    return {
      message: s.reason
    };
  });
};
