#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');

const { Spectral, isOpenApiv3 } = require('@stoplight/spectral');
// const { stylish } = require('@stoplight/spectral/dist/formatters/stylish');

const SPECTRAL_CONFIG = '.spectral.yaml';
const ISP_RULES_PREFIX = process.env.ISP_RULES_PREFIX || './';

// Mapping of Spectral severity to GitHub Actions message level
const SEV_MAP = ['error', 'warning', 'debug', 'debug'];

// Figure out what we are checking.
let filename = 'openapi.yaml';
if (process.argv.length >= 3) {
  filename = process.argv[2];
}

const ISP_RULES_PATH = `${ISP_RULES_PREFIX}isp-rules.yaml`;

// Make sure Spectral's config is set up properly to point to our custom rules.
if (fs.existsSync(SPECTRAL_CONFIG)) {
  // Modify existing file.
  const doc = yaml.safeLoad(fs.readFileSync(SPECTRAL_CONFIG, 'utf8'));

  if (!doc.extends) {
    doc.extends = [];
  }

  if (!doc.extends.includes(ISP_RULES_PATH)) {
    doc.extends.push(ISP_RULES_PATH);
  }

  fs.writeFileSync(SPECTRAL_CONFIG, yaml.dump(doc));
} else {
  // Create dummy file.
  fs.writeFileSync(SPECTRAL_CONFIG, `extends:\n  - ${ISP_RULES_PATH}\n`);
}

// Run the thing!
let failLimit = 0;
if (process.env.FAIL_ON_WARNINGS) {
  failLimit = 1;
}

const doc = fs.readFileSync(filename, 'utf8');

const spectral = new Spectral({
  computeFingerprint: (rule, hash) => {
    // https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/guides/javascript.md#using-custom-de-duplication-strategy
    let id = String(rule.code);

    if (rule.path && rule.path.length) {
      id += JSON.stringify(rule.path);
    } else if (rule.range) {
      id += JSON.stringify(rule.range);
    }

    if (rule.source) id += rule.source;

    // Dedupe based on the error message as well, since some rules can
    // generate many different messages (e.g. English for blocks of text).
    id += rule.message;

    return hash(id);
  }
});

spectral.registerFormat('oas3', isOpenApiv3);
spectral
  .loadRuleset(SPECTRAL_CONFIG)
  .then(() => spectral.run(doc, { resolve: { documentUri: filename } }))
  .then(results => {
    let errors = 0;

    for (let r of results) {
      if (r.severity <= failLimit) {
        errors++;
      }

      // If we are running in GitHub, output metadata to nicely annotate the UI.
      // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/development-tools-for-github-actions#set-an-error-message-error
      if (process.env.GITHUB_ACTIONS) {
        console.log(
          `::${SEV_MAP[r.severity]} file=${r.source},line=${r.range.start.line +
            1},col=${r.range.start.character}::${r.message}`
        );
      }
    }

    // Use the nice default formatter to display results.
    // console.log(stylish(results));
    console.log(results);

    // Set the exit code (0 for success, 1 for failure).
    process.exit(errors > 0);
  });
