// @flow

import { hello } from './index';

test('should say hello', () => {
  expect(hello()).toBe('Hello, world!');
});
