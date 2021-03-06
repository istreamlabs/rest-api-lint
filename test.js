const { execSync } = require('child_process');
const fs = require('fs');

process.env.FAIL_ON_WARNINGS = '1';

describe('Linting fixture files', () => {
  fs.readdirSync('fixtures/lint').forEach(filename => {
    const expect = filename.endsWith('-fail.yaml') ? 'fail' : 'pass';

    it(`${filename} should ${expect} linting`, () => {
      let failed = false;
      let out = null;
      try {
        out = execSync(`./entrypoint.js fixtures/lint/${filename}`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (err) {
        failed = true;
        if (expect === 'pass') {
          if (out) console.log(out.stdout, out.stderr);
          else console.log(err);
          throw new Error('Linting failed when it should pass');
        }
      }

      if (!failed && expect === 'fail') {
        if (out) console.log(out.stdout, out.stderr);
        throw new Error('Linting passed when it should fail');
      }
    });
  });
});

describe('Disable rules test', () => {
  it('should pass when rule is disabled', () => {
    const cwd = process.cwd();

    process.env.ISP_RULES_PREFIX = '../../';
    process.chdir('fixtures/disable');

    try {
      const out = execSync('../../entrypoint.js', {
        stdio: 'pipe',
        encoding: 'utf8'
      });
    } catch (err) {
      throw new Error(err.stdout);
    } finally {
      process.env.ISP_RULES_PREFIX = '';
      process.chdir(cwd);
    }
  });
});
