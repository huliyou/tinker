var assert = require('power-assert');
import Tinker from '../src/index';

describe('Tinker', function() {
  it('test method', function() {
    assert(new Tinker('http://www.baidu.com', { method: 'GET'}, {}).config.method ===  'GET');
  });
});
