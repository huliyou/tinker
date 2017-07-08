class Tinker {
    /* global setting */
    static request;
    static success;
    static isSuccess;
    static failure;
    static isFailure;
    static timeout;
    static debounce;
    static headers;
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
    constructor(url, headers, params) {
      if (arguments.length !== 3) {
        throw(new Error('arguments error'));
      }

      // 参数校验
      if (!url) throw new Error('url should not be null');
      if (!headers) throw new Error('headers should not be null');
      if (!headers.method) throw new Error('headers -> method should not be null');

      this.url = url;
      this.headers = { ...Tinker.headers, ...headers };

      let requestParams;
      if (Array.isArray(params)) {
        requestParams = params;
      } else {
        requestParams = { ...Tinker.params, ...params };
      }

      // body
      if (headers.method.toUpperCase() === 'GET') {
        requestParams && this.url = `${this.url}?${convertParamToQuery(requestParams)}`;
      } else {
        if (this.headers['Content-type'].indexOf('json') !== -1) {
          this.headers = { ...this.headers, ...{ body: JSON.stringify(requestParams) } };
        } else {
          this.headers = { ...this.headers, ...{ body: convertParamToQuery(requestParams) }};
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
    transfromResult(transfromResultCallBack: Function): this {
      this.transfromResultCallBack = transfromResultCallBack;
      return this;
    }

    start() {
      // request
      this.requestCallBack && this.requestCallBack() || Tinker.request && Tinker.request();

      /* global fetch */
      try {
        const fetchPromise = Tinker.engine(this.url, this.headers);
        fetchPromise
          .then(data => data.json())
          .then((data) => {
            let result = data;
            if (this.transfromResultCallBack) {
              result = this.transfromResultCallBack(data);
            }

            // success
            if (this.isSuccess) {
              this.isSuccess(result) && this.isSuccessCallBack(result);
            } else (Tinker.isSuccess) {
              Tinker.isSuccess(result) && Tinker.success(result);
            }

            // failure
            if (this.isFailure) {
              this.isFailure(result) && this.isFailureCallBack(result);
            } else {
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
