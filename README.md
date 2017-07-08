### method link

global setting

```javascript
tinker.request = () => {};
tinker.success = () => {};
tinker.failure = () => {};
tinker.timeout = 5000;
tinker.debounce = 2000;
thnker.headers = {
};
tinker.params = {
}
```

```javascript
new tinker('http://url', { headers}, { params })
  .request(() => {})
  .isSuccess((response) => return true)
  .success((response) => {})
  .isFailure((response, err) => return true)
  .failure((response, err) => {})
  .timeout(5000)
  .debounce(2000)
  .transfromResult(response => { return response})
  .start();
```
