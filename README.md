# tinker

Flexible promise based control flow.

## Features
* promise engine to excute async action.
* support promise isSuccess and success control.
* support promise isFailure and failure control.
* support change tinker promise engine

## Installing

## Example
### global setting
```javascript
// set Tinker promise engine;
Tinker.engine = fetch.bind(window);

// set the global config
Tinker.config = {
  headers: {
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  credentials: 'include',
}

Tinker.request = () => {
  // do something when start.
};
Tinker.isSuccess = (result) => {
  // judge the result is success and return true or false;
  return true;
}
Tinker.success = (result) => {
  // do something when isSuccess() return true;
};
Tinker.isFailure = (result) => {
  // judge the result is failure and return true or false;
  return true;
}
Tinker.failure = (result) => {
  // do something when isFailure() return true;
};
```

### usage
```javascript
new Tinker(
  'http://url',
  { headers: { 'Content-Type': 'application/json'}  },
  { a: 1}
)
  .request(() => { /* do something */})
  .isSuccess((result) => { /* return boolean */})
  .success((result) => {/* do something */})
  .isFailure((result) => {/* return boolean */})
  .failure((result) => {/* do something */})
  .transfromResult(result => { return result })
  .start();
```

## TODO
- [] support xhr2 engine
- [] support timeout
- [] support debounce

## License
MIT
