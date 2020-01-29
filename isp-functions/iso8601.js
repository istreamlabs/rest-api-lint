const DATELIKE = /created|started|executed|modified|canceled|stopped|deleted|date|time/i;

// ISO8601 ensures parameters that look like they might hold dates are formatted
// correctly according to ISO 8601 (e.g. `2020-01-01T12:00:00Z`)
module.exports = targetValue => {
  const errors = [];

  // No parameter should end with a time zone in the name.
  if ((targetValue.name || '').toLowerCase().endsWith('utc')) {
    errors.push({
      message: `${targetValue.name} should not end with a time zone`
    });
  }

  // This looks like a date!
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
      // Probably a counter instead of a date.
      return errors;
    }

    if (!targetValue.schema) {
      errors.push({
        message: `${targetValue.name} should have a schema`
      });
    } else {
      if (targetValue.schema.type && targetValue.schema.type !== 'string') {
        errors.push({
          message: `${targetValue.name} should be a string if it is a date/time`
        });
      }

      if (
        targetValue.schema.format != 'date' &&
        targetValue.schema.format != 'date-time'
      ) {
        errors.push({
          message: `${targetValue.name} should have a string format of 'date' or 'date-time'`
        });
      }
    }
  }

  return errors;
};
