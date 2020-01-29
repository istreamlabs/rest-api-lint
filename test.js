const { execSync } = require('child_process');
const fs = require('fs');

describe('Linting fixture files', () => {
  fs.readdirSync('fixtures/lint').forEach(filename => {
    const expect = filename.endsWith('-fail.yaml') ? 'fail' : 'pass';

    it(`${filename} should ${expect} linting`, () => {
      let failed = false;
      let out = null;
      try {
        out = execSync(`spectral lint -F warn fixtures/lint/${filename}`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (err) {
        failed = true;
        if (expect === 'pass') {
          if (out) console.log(out.stdout, out.stderr);
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
