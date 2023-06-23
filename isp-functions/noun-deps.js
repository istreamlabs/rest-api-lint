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
// appears to not be a plural noun. Singular nouns are allowed at the end of
// a path.
module.exports = targetValue => {
  const errors = [];

  // Split into path pieces ignoring blank/empty ones and params.
  let pieces = targetValue.split('/').filter(i => !!i);

  if ((pieces.length === 1 && pieces[0] === 'search') || pieces[0] === 'me' || pieces[0] === 'cust') {
    // Top-level exceptions. Skip.
    return;
  }

  // No piece should contain verbs.
  for (const value of pieces) {
    if (value.startsWith('{')) continue;

    // Test each verb to see if the value matches or begins with it. The
    // regex below is to prevent e.g. `giver` from triggering the error
    // since it is a noun that begins with a verb.
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

  // Only the last piece is allowed to be singular.
  for (const value of pieces.slice(0, -1)) {
    if (value.startsWith('{')) continue;

    // our api version is in the url as a resource
    // this does not need to be plural
    if (value.match(/v[0-9]+/)) continue;

    // Ensure words are plural if later paths exist.
    const plural = inflection.pluralize(value);
    if (value !== plural) {
      errors.push({
        message: `${value} should be plural: ${plural}`
      });
    }
  }

  return errors;
};
