/**
 * @flow
 * 将Object转为url params string
 * @param params
 * @returns {string}
 * @private
 */
export const convertParamToQuery = (params: {}): string => {
  return Object.keys(params).map((key) => {
    // 不允许嵌套object
    if (params[key] !== null && typeof params[key] === 'object') {
      throw new Error('not allow nested Object');
    }
    // 过滤null 和 undefined
    if (params[key] !== null && params[key] !== undefined) {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
    }
    return '';
  }).filter(item => item !== '').join('&');
};
