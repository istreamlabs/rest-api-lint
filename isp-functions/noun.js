const { createRulesetFunction } = require('@stoplight/spectral-core');
const inflection = require('inflection');

const VERBS = [
  'allow',
  'create',
  'make',
  'open',
  'begin',
  'write',
  'convert',
  'put',
  'set',
  'read',
  'get',
  'fetch',
  'take',
  'give',
  'find',
  'delete',
  'close'
];

module.exports = createRulesetFunction(
  {
    input: { type: 'string' },
    options: null
  },
  function noun(targetValue) {
    const errors = [];

    let pieces = targetValue.split('/').filter(i => !!i);

    if (
      (pieces.length === 1 && pieces[0] === 'search') ||
      pieces[0] === 'me' ||
      pieces[0] === 'cust' ||
      (pieces.length === 6 && pieces[4] === 'preview')
    ) {
      return;
    }

    for (const value of pieces) {
      if (value.startsWith('{')) continue;

      for (const verb of VERBS) {
        if (
          (value.length === verb.length && value === verb) ||
          (value.length > verb.length &&
            value.startsWith(verb) &&
            value[verb.length].match(/[ -_A-Z]/))
        ) {
          errors.push({
            message: `${value} should be a noun`
          });
        }
      }
    }

    for (const value of pieces.slice(0, -1)) {
      if (value.startsWith('{')) continue;

      if (value.match(/v[0-9]+/)) continue;

      const plural = inflection.pluralize(value);
      if (value !== plural) {
        errors.push({
          message: `${value} should be plural: ${plural}`
        });
      }
    }

    return errors;
  }
);
