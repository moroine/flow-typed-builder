/* eslint-env node, jest */

const { execFileSync } = require('child_process');
const chalk = require('chalk');
const flow = require('flow-bin');

expect.extend({
  toBeValidFlowTypeDeclarations(source) {
    try {
      execFileSync(
        flow,
        ['check-contents', '--all', '--color=always', '--timeout=30'],
        {
          input: source,
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );
    } catch (err) {
      return {
        message: () => `expected ${chalk.bold(
          source.trimEnd(),
        )} to be valid flow:\n${chalk.red(err.stdout)}`,
        pass: false,
      };
    }

    return {
      message: () => `expected ${chalk.bold(
        source.trimEnd(),
      )} not to be valid flow`,
      pass: true,
    };
  },
});
