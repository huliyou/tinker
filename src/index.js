/**
 * @flow
 * 将Object转为url params string
 * @param params
 * @returns {string}
 * @private
 */
const convertParamToQuery = (params: {}): string => {
  return Object.keys(params).map((key) => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
  }).join('&');
};

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
          this.url = `${this.url}?${convertParamToQuery(requestParams)}`;
        }
      } else {
        if (this.config.headers && this.config.headers['Content-type'] && this.config.headers['Content-type'].indexOf('json') !== -1) {
          this.config = { ...this.config, ...{ body: JSON.stringify(requestParams) } };
        } else {
          this.config = { ...this.config, ...{ body: convertParamToQuery(requestParams) }};
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

    start() {
      // request
      this.requestCallBack && this.requestCallBack() || Tinker.request && Tinker.request();

      /* global fetch */
      try {
        const fetchPromise = fetch(this.url, this.config);
        fetchPromise
          .then(data => data.json())
          .then((data) => {
            let result = data;
            if (this.convertResultCallBack) {
              result = this.convertResultCallBack(data);
            }

            // success
            if (this.isSuccessCallBack) {
              this.isSuccessCallBack(result) && this.successCallBack(result);
            } else if (Tinker.isSuccess) {
              if (Tinker.isSuccess && Tinker.isSuccess(result)) {
                Tinker.success && Tinker.success(result);
                this.successCallBack && this.successCallBack(result);
              }
            }

            // failure
            if (this.isFailureCallBack) {
              this.isFailureCallBack(result) && this.failureCallBack(result);
            } else if(Tinker.isFailure) {
              Tinker.isFailure(result) && Tinker.failure(result);
            }
          });
        if (this.timeout && this.timeout > 0) {
          const abortPromise = new Promise((resolve) => {
            setTimeout(
              resolve(() => {
                this.failureCallBack && this.failureCallBack({ message: '超时' });
                FetchHandler.globalFailureCallBack &&
                FetchHandler.globalFailureCallBack({ message: '超时' });
              }),
              this.timeout ? this.timeout : 0,
            );
          });
          Promise.race([fetchPromise, abortPromise]);
        }
      } catch (e) {
        FetchHandler.globalFailureCallBack && FetchHandler.globalFailureCallBack(e);
        if (this.failureCallBack) {
          this.failureCallBack({ message: e });
        } else {
          console.error(e);
        }
      }
    }
}

export default Tinker;
