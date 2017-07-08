/**
 * @flow
 * Happy Hacking
 * Created by leiyouwho on 3/5/2016.
 */

export const SUCCESS = (actionName: string) => {
  return `${actionName}_SUCCESS`;
};

export const FAILURE = (actionName: string) => {
  return `${actionName}_FAILURE`;
};

export const REQUEST = (actionName: string) => {
  return `${actionName}_REQUEST`;
};
