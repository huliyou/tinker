/* @flow */

import * as responseCode from './responseCode';

/**
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

type CacheType = 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
type MethodType = 'GET' | 'POST' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PUT' | 'PATCH' ;
type ModeType = 'cors' | 'no-cors' | 'same-origin';
type ReferrerPolicyType =
    '' | 'no-referrer' | 'no-referrer-when-downgrade' | 'origin-only' |
    'origin-when-cross-origin' | 'unsafe-url';
type RedirectType = 'follow' | 'error' | 'manual';
type CredentialsType = 'omit' | 'same-origin' | 'include';

export type configType = {
  method?: ?MethodType;
  headers?: ?Object;
  mode?: ?ModeType;
  integrity?: ?string;
  cache?: ?CacheType;
  credentials?: ?CredentialsType;
  redirect?: ?RedirectType;
  referrer?: ?string;
  referrerPolicy?: ?ReferrerPolicyType;
};

class FetchHandler {
  // 全局配置
  static globalConfig: configType;
  // 全局请求参数
  static globalParams: Object;
  // 全局请求回调
  static globalRequestCallBack: Function;
  // 全局成功回调
  static globalSuccessCallBack: Function;
  // 全局失败回调
  static globalFailureCallBack: Function;
  // 请求地址
  url: string;
  // 配置
  config: configType;
  // 参数
  params: Object;
  // 超时时间（ms)
  timeout: ?number;
  // 设置请求回调
  request: Function;
  // 设置成功回调
  success: Function;
  // 设置失败回调
  failure: Function;
  // 设置请求结果变换回调
  transfromResult: Function;
  // 请求回调
  requestCallBack: Function;
  // 成功回调
  successCallBack: Function;
  // 失败回调
  failureCallBack: Function;
  // 请求结果变换回调
  transfromResultCallBack: Function;
  // 设置超时
  setRequestTimeout: Function;
  // 执行请求
  start: Function;

  constructor(url: string, config: configType, params: Object) {
    if (!url) throw new Error('url should not be null');
    if (!config) throw new Error('config should not be null');
    if (!config.method) throw new Error('config -> method should not be null');
    // this.config = Object.assign({}, FetchHandler.globalConfig, config);
    this.config = { ...FetchHandler.globalConfig, ...config };
    this.url = url;
    let requestParams: Object | Array<any>;
    //  = Object.assign({}, FetchHandler.globalParams, params);
    if (Array.isArray(params)) {
      requestParams = params;
    } else {
      requestParams = { ...FetchHandler.globalParams, ...params };
    }
    if (config.method.toUpperCase() === 'GET') {
      this.url = `${this.url}?${convertParamToQuery(requestParams)}`;
    } else {
      if (this.config.headers['Content-type'].indexOf('json') !== -1) {
        this.config = { ...this.config, ...{ body: JSON.stringify(requestParams) } };
      } else {
        this.config = { ...this.config, ...{ body: convertParamToQuery(requestParams) }};
      }
    }
  }
  request(requestCallBack: Function): this {
    this.requestCallBack = requestCallBack;
    return this;
  }
  failure(failureCallBack: Function): this {
    this.failureCallBack = failureCallBack;
    return this;
  }
  success(successCallBack: Function): this {
    this.successCallBack = successCallBack;
    return this;
  }
  transfromResult(transfromResultCallBack: Function): this {
    this.transfromResultCallBack = transfromResultCallBack;
    return this;
  }
  setRequestTimeout(timeout: number): this {
    this.timeout = timeout;
    return this;
  }
  start(): void {
    FetchHandler.globalRequestCallBack && FetchHandler.globalRequestCallBack();
    this.requestCallBack && this.requestCallBack();
    /* global fetch */
    try {
      const fetchPromise = fetch(this.url, this.config);
      fetchPromise
        .then(data => data.json())
        .then((data) => {
          let result = data;
          if (this.transfromResultCallBack) {
            result = this.transfromResultCallBack(data);
          }
          switch (result.code) {
            case responseCode.SUCCESS:
              FetchHandler.globalSuccessCallBack && FetchHandler.globalSuccessCallBack(result);
              this.successCallBack && this.successCallBack(result);
              break;
            default:
              FetchHandler.globalFailureCallBack && FetchHandler.globalFailureCallBack(result);
              this.failureCallBack && this.failureCallBack(result);
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

export default FetchHandler;
