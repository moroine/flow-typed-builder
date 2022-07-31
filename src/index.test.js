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
    ['flowgen/conditional'],
    ['flowgen/declaration-file'],
    ['flowgen/exports'],
    ['flowgen/function-exports'],
    ['flowgen/interface-exports'],
    ['flowgen/interfaces'],
    ['flowgen/mapped-types'],
    ['flowgen/string-literals'],
    ['flowgen/variables'],
    ['declare'],
    ['interface'],
    ['intersection'],
  ])('should transform %s', async (name) => {
    await executeTest(name);
  });
});

test.skip('should mongo %s', async () => {
  const input = await readFile(`${__dirname}/tests/fixtures/mongo/input.ts`);
  const output = tsToFlow(input);

  // fs.writeFileSync(`${__dirname}/tests/fixtures/mongo/expected.js`, output);
  // $FlowExpectedError[incompatible-call]
  expect(output).toBeValidFlowTypeDeclarations();
});
