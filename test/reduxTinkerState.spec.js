import { SUCCESS, FAILURE, REQUEST } from '../src/reduxTinkerState';
var assert = require('power-assert');

describe('reduxTinkerState', () => {
  it('SUCCESS', () => {
    assert(SUCCESS('HELLO') === 'HELLO_SUCCESS');
  });
  it('FAILURE', () => {
    assert(FAILURE('HELLO') === 'HELLO_FAILURE');
  });
  it('REQUEST', () => {
    assert(REQUEST('HELLO') === 'HELLO_REQUEST');
  });
})
