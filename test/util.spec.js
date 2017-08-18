import { convertParamToQuery } from '../src/util';
var assert = require('power-assert');

describe('util', () => {
  describe('convertParamToQuery', () => {
    describe('将Object转为url params string', () => {
      it('允许只有一个键值对', () => {
        assert(convertParamToQuery({ a: 'hello' }) === 'a=hello');
      });
      it('允许多个键值对', () => {
        assert(convertParamToQuery({ a: 'hello', b: 'world' }) === 'a=hello&b=world');
      });
      it('键值对，值会编码', () => {
        assert(convertParamToQuery({ a: '中国' }) !== 'a=中国');
        assert(convertParamToQuery({ a: '中国' }) === `a=${encodeURIComponent('中国')}`);
      });
      it('不允许嵌套键值对', () => {
        assert.throws(
          () => {
            convertParamToQuery({ a: {b: 'hello'} })
          },
          (err) => {
            return err.message === 'not allow nested Object';
          },
          'did not throw with expected message',
        );
      });
      it('过滤null', () => {
        assert(convertParamToQuery({ a: null }) === '');
      });
      it('过滤undefined', () => {
        assert(convertParamToQuery({ a: undefined }) === '');
      });
      it ('综合例子', () => {
        assert(convertParamToQuery({ a: undefined, b: null, c: 1, d: 'sdf' }) === 'c=1&d=sdf');
      })
    })
  })
})
