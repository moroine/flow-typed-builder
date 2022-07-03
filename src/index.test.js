// @flow

import fs from 'fs';
import { tsToFlow } from './index';

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, content) => {
      if (err) {
        reject(err);
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
  // $FlowExpectedError[incompatible-call]
  expect(output).toBeValidFlowTypeDeclarations();
}

describe('interface', () => {
  test.each([
    ['flowgen/basic'],
    ['flowgen/boolean-literals'],
    ['flowgen/classes'],
    ['flowgen/computed'],
    ['flowgen/interfaces'],
    ['interface'],
    ['flowgen/string-literals'],
  ])('should transform %s', async (name) => {
    await executeTest(name);
  });
});
