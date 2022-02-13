// @flow

import fs from 'fs';
import { tsToFlow } from './index';

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve('');
        } else {
          reject(err);
        }
      } else { resolve(content); }
    });
  });
}

async function executeTest(name) {
  const [input, expected] = await Promise.all([
    readFile(`${__dirname}/tests/fixtures/${name}/input.ts`),
    readFile(`${__dirname}/tests/fixtures/${name}/expected.js`),
  ]);
  const output = tsToFlow(input);

  expect(output).toBe(expected);
  // $FlowExpectedError
  expect(output).toBeValidFlowTypeDeclarations();
}

describe('interface', () => {
  test.each([
    ['flowgen/basic'],
    ['flowgen/boolean-literals'],
    ['interface'],
  ])('should transform %s', async (name) => {
    await executeTest(name);
  });
});