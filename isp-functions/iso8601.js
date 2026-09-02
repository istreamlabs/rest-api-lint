const { createRulesetFunction } = require('@stoplight/spectral-core');

const DATELIKE = /created|started|executed|modified|canceled|stopped|deleted|date|time/i;

module.exports = createRulesetFunction(
  {
    input: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        schema: { type: 'object' }
      }
    },
    options: null
  },
  function iso8601(targetValue, _options, context) {
    if (!targetValue) {
      return [];
    }

    const errors = [];

    if ((targetValue.name || '').toLowerCase().endsWith('utc')) {
      errors.push({
        message: `${targetValue.name} should not end with a time zone`
      });
    }

    if (
      DATELIKE.test(targetValue.name) &&
      (!targetValue.schema ||
        !targetValue.schema.type ||
        targetValue.schema.type === 'string' ||
        targetValue.schema.type === 'integer' ||
        targetValue.schema.type === 'number')
    ) {
      if (
        targetValue.name.includes('times') ||
        targetValue.name.includes('count') ||
        targetValue.name.includes('instances')
      ) {
        return errors;
      }

      if (!targetValue.schema) {
        errors.push({
          message: `${targetValue.name} should have a schema`
        });
      } else {
        const p = context.path.concat(['schema']);
        if (targetValue.schema.type && targetValue.schema.type !== 'string') {
          errors.push({
            message: `${targetValue.name} should be a string if it is a date/time`,
            path: targetValue.schema.type ? p.concat(['type']) : p
          });
        }

        if (
          targetValue.schema.format != 'date' &&
          targetValue.schema.format != 'date-time'
        ) {
          errors.push({
            message: `${targetValue.name} should have a string format of 'date' or 'date-time'`,
            path: p
          });
        }
      }
    }

    return errors;
  }
);
