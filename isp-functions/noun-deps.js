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

// The noun function takes the name of something and returns an error if it
// appears to not be a plural noun.
module.exports = targetValue => {
  const value = targetValue.split('/').pop();

  if (value.startsWith('{')) {
    // This is a path parameter. Skip it!
    return;
  }

  // Test each verb to see if the value matches or begins with it. The
  // regex below is to prevent e.g. `giver` from triggering the error
  // since it is a noun that begins with a verb.
  for (const verb of VERBS)
    if (
      (value.length === verb.length && value === verb) ||
      (value.length > verb.length &&
        value.startsWith(verb) &&
        value[verb.length].match(/[ -_A-Z]/))
    ) {
      return [
        {
          message: `${value} should be a noun`
        }
      ];
    }

  // Pluralization exceptions.
  if (value === 'me' || value === 'search') {
    return;
  }

  const plural = inflection.pluralize(value);
  if (value !== plural) {
    return [
      {
        message: `${value} should be plural: ${plural}`
      }
    ];
  }
};
