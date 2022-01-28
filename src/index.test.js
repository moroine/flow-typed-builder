// @flow

import { hello } from './index';

test('should say hello', () => {
  expect(hello()).toBe(`interface Person {
  firstName: string,
  lastName: string,
  age: number,
}
;`);
});
