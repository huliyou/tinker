import * as reduxFetchState from './reduxFetchState';

require('../aop');

function reduxFetch (fetchHandler, actionName, dispatch) {
  if (!reduxFetch.dispatch) reduxFetch.dispatch = dispatch;
  // 注入请求态后处理
  if (fetchHandler.requestCallBack) {
    fetchHandler.requestCallBack = fetchHandler.requestCallBack.after(
      () => {
        reduxFetch.dispatch({
          type: reduxFetchState.REQUEST(actionName),
        });
      },
    );
  } else {
    fetchHandler.requestCallBack = () => {
      reduxFetch.dispatch({
        type: reduxFetchState.REQUEST(actionName),
      });
    };
  }

  // 注入成功态后处理
  if (fetchHandler.successCallBack) {
    fetchHandler.successCallBack = fetchHandler.successCallBack.after(
      (data) => {
        console.warn('SUCCESS: ', data);
        reduxFetch.dispatch({
          type: reduxFetchState.SUCCESS(actionName),
          payload: data,
        });
      },
    );
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
    fetchHandler.failureCallBack = fetchHandler.failureCallBack.after(
      (data) => {
        reduxFetch.dispatch({
          type: reduxFetchState.FAILURE(actionName),
          payload: data,
        });
      },
    );
  } else {
    fetchHandler.failureCallBack = (data) => {
      reduxFetch.dispatch({
        type: reduxFetchState.FAILURE(actionName),
        payload: data,
      });
    };
  }
  return fetchHandler;
}

export default reduxFetch;
