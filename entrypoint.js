#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');

const SPECTRAL_CONFIG = '.spectral.yaml';
const ISP_RULES_PREFIX = process.env.ISP_RULES_PREFIX || './';

let filename = 'openapi.yaml';
if (process.argv.length >= 3) {
  filename = process.argv[2];
}

const ISP_RULES_PATH = `${ISP_RULES_PREFIX}isp-rules.yaml`;

if (fs.existsSync(SPECTRAL_CONFIG)) {
  let doc = yaml.load(fs.readFileSync(SPECTRAL_CONFIG, 'utf8'));

  if (!doc || typeof doc !== 'object') {
    doc = {};
  }

  if (!doc.extends) {
    doc.extends = [];
  }

  if (!doc.extends.includes(ISP_RULES_PATH)) {
    doc.extends.push(ISP_RULES_PATH);
  }

  fs.writeFileSync(SPECTRAL_CONFIG, yaml.dump(doc));
} else {
  fs.writeFileSync(SPECTRAL_CONFIG, `extends:\n  - ${ISP_RULES_PATH}\n`);
}

const spectralBin = path.join(__dirname, 'node_modules', '.bin', 'spectral');
const args = ['lint', filename, '--ruleset', SPECTRAL_CONFIG];

if (process.env.FAIL_ON_WARNINGS) {
  args.push('--fail-severity', 'warn');
}

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

const result = spawnSync(spectralBin, args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
