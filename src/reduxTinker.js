import * as reduxFetchState from './reduxTinkerState';
import Tinker from './index';

// require('./aop');

function reduxFetch (fetchHandler, actionName, dispatch) {
  if (!reduxFetch.dispatch) reduxFetch.dispatch = dispatch;
  // 注入请求态后处理
  if (fetchHandler.requestCallBack) {
    const originCallBack = fetchHandler.requestCallBack;
    fetchHandler.requestCallBack = function(params) {
      originCallBack(params);
      reduxFetch.dispatch({
        type: reduxFetchState.REQUEST(actionName),
      });
    }
    // fetchHandler.requestCallBack = fetchHandler.requestCallBack.after(
    //   () => {
    //     reduxFetch.dispatch({
    //       type: reduxFetchState.REQUEST(actionName),
    //     });
    //   },
    // );
  } else {
    fetchHandler.requestCallBack = () => {
      reduxFetch.dispatch({
        type: reduxFetchState.REQUEST(actionName),
      });
    };
  }

  // 注入成功态后处理
  if (fetchHandler.successCallBack) {
    const originCallBack = fetchHandler.successCallBack;
    fetchHandler.successCallBack = function(params) {
      originCallBack(params);
      reduxFetch.dispatch({
        type: reduxFetchState.SUCCESS(actionName),
        payload: params,
      });
    }
    // fetchHandler.successCallBack = fetchHandler.successCallBack.after(
    //   (data) => {
    //     reduxFetch.dispatch({
    //       type: reduxFetchState.SUCCESS(actionName),
    //       payload: data,
    //     });
    //   },
    // );
  } else {
    fetchHandler.successCallBack = (data) => {
      reduxFetch.dispatch({
        type: reduxFetchState.SUCCESS(actionName),
        payload: data,
      });
    };
  }

  // 注入失败态后处理
  if (fetchHandler.failureCallBack) {
    const originCallBack = fetchHandler.failureCallBack;
    fetchHandler.failureCallBack = function(params) {
      originCallBack(params);
      reduxFetch.dispatch({
        type: reduxFetchState.FAILURE(actionName),
        payload: params,
      });
    }
    // fetchHandler.failureCallBack = fetchHandler.failureCallBack.after(
    //   (data) => {
    //     reduxFetch.dispatch({
    //       type: reduxFetchState.FAILURE(actionName),
    //       payload: data,
    //     });
    //   },
    // );
  } else {
    fetchHandler.failureCallBack = (data) => {
      Tinker.failure(data);
      reduxFetch.dispatch({
        type: reduxFetchState.FAILURE(actionName),
        payload: data,
      });
    };
  }
  return fetchHandler;
}

export default reduxFetch;
