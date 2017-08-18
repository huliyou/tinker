var assert = require('power-assert');
import Tinker from '../src/index';

describe('Tinker', () => {
  describe('构造参数', () => {
    Tinker.config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      credentials: 'include',
    }
    Tinker.engine = (url, config) => new Promise((resolve, reject) => {
      resolve({
        json: () => ({ code: '000001' }),
        text: () => '{ code: 000001 }',
      });
    });
    it('参数长度校验', () => {
      assert.throws(
        () => {
          new Tinker();
        },
        (err) => {
          return err.message === 'arguments error';
        },
      );
      assert.throws(
        () => {
          new Tinker('http://www.baidu.com');
        },
        (err) => {
          return err.message === 'arguments error';
        },
      );
      assert(new Tinker('http://www.baidu.com', { method: 'GET' }, {}));
    });

    it('参数正确性校验, url不为空', () => {
      assert.throws(
        () => {
          new Tinker(null, { method: 'GET' }, {});
          new Tinker(undefined, { method: 'GET' }, {});
          new Tinker('', { method: 'GET' }, {});
        },
        (err) => {
          return err.message === 'url should not be null';
        },
      );
    });

    it('参数正确性校验，config不能为空', () =>{
      assert.throws(
        () => {
          new Tinker('sdkfj', null, {});
          new Tinker('sdkfj', undefined, {});
          new Tinker('sdkfj', '', {});
        },
        (err) => {
          return err.message === 'config should not be null';
        },
      );
    });

    it('参数正确性校验，config里method不能为空', () =>{
      assert.throws(
        () => {
          new Tinker('sdkfj', { sfkjs: 'sdlkfjsdlkfj'}, {});
          new Tinker('sdkfj', { method: null }, {});
          new Tinker('sdkfj', { method: '' }, {});
        },
        (err) => {
          return err.message === 'config -> method should not be null';
        },
      );
    });

    it('GET方法请求地址', () => {
      assert(new Tinker('http://www.baidu.com', { method: 'GET' }, { a: 'hello', b: 'world' }).url === 'http://www.baidu.com?a=hello&b=world');
      assert(new Tinker('http://www.baidu.com', { method: 'GET' }, { }).url === 'http://www.baidu.com');
    });

    it('POST方法请求地址', () => {
      assert(new Tinker('http://www.baidu.com', { method: 'POST' }, { a: 'hello', b: 'world' }).url === 'http://www.baidu.com');
      assert(new Tinker('http://www.baidu.com', { method: 'POST' }, { }).url === 'http://www.baidu.com');
    });

    it('Content-Type: application/json', () => {
      const body = new Tinker('slkfjsldkf', { method: 'POST', headers: {'Content-Type': 'application/json' }}, { a: 'hello', b: 'world' }).config.body;
      assert(body === JSON.stringify({ a: 'hello', b: 'world' }));
    });

    it('Content-Type: multipart/form-data', () => {
      const formData = new Tinker('slkfjsldkf', { method: 'POST', headers: {'Content-Type': 'multipart/form-data' }}, { a: 'hello', b: 'world' }).config.body;
      assert(formData.has('a'));
      assert(formData.get('a') === 'hello');
      assert(formData.has('b'));
      assert(formData.get('b') === 'world');
    });
  });
  describe('request', () => {
    Tinker.engine = (url, config) => new Promise((resolve, reject) => {
      resolve({
        json: () => ({ code: '000001' }),
        text: () => '{ code: 000001 }',
      });
    });
    it('Tinker request', () => {
      var a = 0;
      Tinker.config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      Tinker.request = () => {
        a++;
      }
      new Tinker('sdjflksdf', { method: 'GET' }, {}).start();
      assert(a === 1);
    });

    it('new Tinker().request', () => {
      var b = 0, c = 0;
      Tinker.config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      Tinker.request = () => {
        b = b + 1;
      }
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .request(() => {
          c = c + 1;
        })
        .start();
      assert(b === 0);
      assert(c === 1);
    });
  });
  describe('success', () => {
    Tinker.engine = (url, config) => new Promise((resolve, reject) => {
      resolve({
        json: () => ({ code: '000001' }),
        text: () => '{ code: 000001 }',
      });
    });
    Tinker.config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    it('Tinker.isSuccess is true and Tinker.success will execute', () => {
      var a = 0;
      Tinker.isSuccess = result => {
        return result.a === 1;
      }
      Tinker.success = (result) => {
        a++;
        assert(a === 1);
      };
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .start({ a: 1 });
    });

    it('Tinker.isSuccess not true and Tinker.success will not execute', () => {
      var a = 0;
      Tinker.isSuccess = result => {
        return result.a === 0;
      }
      Tinker.success = (result) => {
        assert(false);
      };
      Tinker.isFailure = result => {
        return result.a === 1;
      }
      Tinker.failure = (result) => {
        assert(a === 0);
      }
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .start({ a: 1 });
    });

    it('new Tinker().isSuccess is true and new Tinker().success will execute', () => {
      var a = 0;
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .isSuccess(result => result.a === 1)
        .success(result => {
          a++;
          assert(a === 1);
        })
        .start({ a: 1 });
    });

    it('new Tinker().isSuccess is false and new Tinker().success will not execute', () => {
      var a = 0;
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .isSuccess(result => result.a !== 1)
        .success(result => {
          assert(a !== 0);
        })
        .start({ a: 1 });
    });
  });
  describe('failure', () => {
    Tinker.engine = (url, config) => new Promise((resolve, reject) => {
      resolve({
        json: () => ({ code: '000001' }),
        text: () => '{ code: 000001 }',
      });
    });
    Tinker.config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    it('Tinker.isFailure is true and Tinker.failure will execute', () => {
      var a = 0;
      Tinker.isFailure = result => {
        return result.a === 1;
      }
      Tinker.failure = (result) => {
        a++;
        assert(a === 1);
      };
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .start({ a: 1 });
    });

    it('Tinker.isFailure not true and Tinker.failure will not execute', () => {
      var a = 0;
      Tinker.isFailure = result => {
        return result.a === 0;
      }
      Tinker.failure = (result) => {
        assert(false);
      };
      Tinker.isSuccess = result => {
        return result.a === 1;
      }
      Tinker.success = (result) => {
        assert(a === 0);
      }
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .start({ a: 1 });
    });

    it('new Tinker().isFailure is true and new Tinker().failure will execute', () => {
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .isFailure(result => result.a === 1)
        .failure(result => {
          assert(result.a === 1);
        })
        .start({ a: 1 });
    });

    it('new Tinker().isFailure is false and new Tinker().failure will not execute', () => {
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .isSuccess(result => result.a !== 1)
        .failure(result => {
          assert(false);
        })
        .start({ a: 1 });
    });
  });
  describe('convertResult', () => {
    it('change the fetch result', () => {
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .convertResult(result => ({ b: 2 }))
        .isSuccess(result => result.b === 2)
        .success(result => {
          assert(result.b === 2);
        })
        .start({ a: 1 });
    });
  });
  describe('start', () => {
    it('start workflow', () => {
      new Tinker('sdjflksdf', { method: 'GET' }, {})
        .convertResult(result => ({ b: 2 }))
        .isSuccess(result => result.b === 2)
        .success(result => {
          assert(result.b === 2);
        })
        .isFailure(result => result.b === 2)
        .failure(result => {
          assert(result.b === 2);
        })
        .start({ a: 1 });
    });
  });
});
