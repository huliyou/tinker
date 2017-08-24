import { convertParamToQuery } from './util';

class Tinker {
    /* global setting */
    static request;
    static success;
    static isSuccess;
    static failure;
    static isFailure;
    static timeout;
    static debounce;
    static config;
    static params;
    // 引擎
    static engine;

    /**
     * [constructor description]
     * @param  {string} url     请求地址
     * @param  {object} headers 请求头
     * @param  {object | array} params  请求参数
     * @return {[type]}         [description]
     */
    constructor(url, config, params) {
      if (arguments.length !== 3) {
        throw(new Error('arguments error'));
      }

      // 参数校验
      if (!url) throw new Error('url should not be null');
      if (!config) throw new Error('config should not be null');
      if (!config.method) throw new Error('config -> method should not be null');

      this.url = url;
      this.config = { ...Tinker.config, ...config };

      let requestParams;
      if (Array.isArray(params)) {
        requestParams = params;
      } else {
        requestParams = { ...Tinker.params, ...params };
      }

      // body
      if (config.method.toUpperCase() === 'GET') {
        if (requestParams) {
          const urlParams = convertParamToQuery(requestParams);
          if (urlParams) {
            this.url = `${this.url}?${urlParams}`;
          }
        }
      } else {
        if (this.config.headers && this.config.headers['Content-Type'] && this.config.headers['Content-Type'].indexOf('application/json') !== -1) {
          this.config = { ...this.config, ...{ body: JSON.stringify(requestParams) } };
        } else if (this.config.headers && this.config.headers['Content-Type'] && this.config.headers['Content-Type'].indexOf('application/x-www-form-urlencoded') !== -1){
          this.config = { ...this.config, ...{ body: convertParamToQuery(requestParams) }};
        } else if (this.config.headers && this.config.headers['Content-Type'] && this.config.headers['Content-Type'].indexOf('multipart/form-data') !== -1) {
          let formData = new FormData();
          Object.keys(requestParams).forEach(item => {
            formData.append(item, requestParams[item]);
          });
          this.config = { ...this.config, ...{ body: formData }};
        } else {
          throw new Error('not support Content-Type');
        }
      }
    }

    // 请求时回调
    request(requestCallBack) {
      this.requestCallBack = requestCallBack;
      return this;
    }
    // 设置判断成功状态回调
    isSuccess(isSuccessCallBack) {
      this.isSuccessCallBack = isSuccessCallBack;
      return this;
    }
    // 设置成功时回调
    success(successCallBack) {
      this.successCallBack = successCallBack;
      return this;
    }
    // 设置判断成功状态回调
    isFailure(isFailureCallBack) {
      this.isFailureCallBack = isFailureCallBack;
      return this;
    }
    // 设置失败回调
    failure(failureCallBack) {
      this.failureCallBack = failureCallBack;
      return this;
    }
    // change result
    convertResult(convertResultCallBack) {
      this.convertResultCallBack = convertResultCallBack;
      return this;
    }

    start(fakeResult) {
      // request
      if (this.requestCallBack) {
        this.requestCallBack();
      } else if (Tinker.request) {
        Tinker.request();
      }

      /* global fetch */
      try {
        const fetchPromise = Tinker.engine(this.url, this.config);
        fetchPromise
          .then(data => {
            let result;
            try {
              result = data.json();
            } catch(e) {
              result = data.text();
            }
            return result;
          })
          .then((data) => {
            let result = data;
            if (fakeResult) {
              result = fakeResult;
            }
            if (this.convertResultCallBack) {
              result = this.convertResultCallBack(data);
            }
            // success
            if (this.isSuccessCallBack) {
              this.isSuccessCallBack(result) && this.successCallBack(result);
            } else if (Tinker.isSuccess) {
              if (Tinker.isSuccess && Tinker.isSuccess(result)) {
                // Tinker.success && Tinker.success(result);
                // this.successCallBack && this.successCallBack(result);
                if (this.successCallBack) {
                  this.successCallBack(result);
                } else if (Tinker.success) {
                  Tinker.success(result);
                }
              }
            }

            // failure
            if (this.isFailureCallBack) {
              this.isFailureCallBack(result) && this.failureCallBack(result);
              // if (this.isFailureCallBack(result) && this.failureCallBack) {
              //   this.failureCallBack(result);
              // }
            } else if(Tinker.isFailure) {
              if (Tinker.isFailure && Tinker.isFailure(result)) {
                // Tinker.failure && Tinker.failure(result);
                if (this.failureCallBack) {
                  this.failureCallBack(result);
                } else if (Tinker.failure) {
                  Tinker.failure(result);
                }
              }
              // if (Tinker.isFailure(result)) {
              //   if (this.failureCallBack) {
              //     this.failureCallBack(result);
              //   } else if (Tinker.failure) {
              //     Tinker.failure(result);
              //   }
              // }
            }
          });
        // if (this.timeout && this.timeout > 0) {
        //   const abortPromise = new Promise((resolve) => {
        //     setTimeout(
        //       resolve(() => {
        //         this.failureCallBack && this.failureCallBack({ message: '超时' });
        //         FetchHandler.globalFailureCallBack &&
        //         FetchHandler.globalFailureCallBack({ message: '超时' });
        //       }),
        //       this.timeout ? this.timeout : 0,
        //     );
        //   });
        //   Promise.race([fetchPromise, abortPromise]);
        // }
      } catch (e) {
        // FetchHandler.globalFailureCallBack && FetchHandler.globalFailureCallBack(e);
        // if (this.failureCallBack) {
        //   this.failureCallBack({ message: e });
        // } else {
        //   console.error(e);
        // }
      }
    }
}

export default Tinker;
