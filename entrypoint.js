#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');

const SPECTRAL_CONFIG = '.spectral.yaml';
const ISP_RULES_PREFIX = process.env.ISP_RULES_PREFIX || './';

// OpenAPI spec to lint; defaults to openapi.yaml in the working directory.
let filename = 'openapi.yaml';
if (process.argv.length >= 3) {
  filename = process.argv[2];
}

const ISP_RULES_PATH = `${ISP_RULES_PREFIX}isp-rules.yaml`;

function failSpectralConfig(message) {
  console.error(`${SPECTRAL_CONFIG}: ${message}`);
  process.exit(1);
}

// Merge ISP rules into an existing consumer .spectral.yaml when present.
if (fs.existsSync(SPECTRAL_CONFIG)) {
  let doc;
  try {
    doc = yaml.load(fs.readFileSync(SPECTRAL_CONFIG, 'utf8'));
  } catch (err) {
    failSpectralConfig(err.message);
  }

  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    failSpectralConfig('must be a YAML mapping, not null, a scalar, or a sequence');
  }

  if (!doc.extends) {
    doc.extends = [];
  }

  if (!doc.extends.includes(ISP_RULES_PATH)) {
    doc.extends.push(ISP_RULES_PATH);
  }

  fs.writeFileSync(SPECTRAL_CONFIG, yaml.dump(doc));
} else {
  // Bootstrap a minimal ruleset when the consumer has no Spectral config yet.
  fs.writeFileSync(SPECTRAL_CONFIG, `extends:\n  - ${ISP_RULES_PATH}\n`);
}

const spectralBin = path.join(__dirname, 'node_modules', '.bin', 'spectral');
const args = ['lint', filename, '--ruleset', SPECTRAL_CONFIG];

// Treat warnings as failures when CI or callers set FAIL_ON_WARNINGS.
if (process.env.FAIL_ON_WARNINGS) {
  args.push('--fail-severity', 'warn');
}

// In GitHub Actions, emit both annotation and human-readable output to stdout.
if (process.env.GITHUB_ACTIONS) {
  args.push(
    '-f',
    'github-actions',
    '-f',
    'stylish',
    '-o.github-actions',
    '<stdout>',
    '-o.stylish',
    '<stdout>'
  );
} else {
  args.push('-f', 'stylish');
}

// Run `spectral lint` with the desired args
const result = spawnSync(spectralBin, args, { stdio: 'inherit' });

// Propagate Spectral's exit code (default to 1 if the process did not start).
process.exit(result.status ?? 1);
