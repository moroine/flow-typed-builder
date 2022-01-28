// @flow

import { hello } from './index.js';

test('should say hello', () => {
  expect(hello()).toBe('Hello, world!');
});
