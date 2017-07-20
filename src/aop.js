Function.prototype.before = function(beforefn) {
  const self = this;
  return function(args) {
    beforefn.apply(this, args);
    return self.apply(this, args);
  };
};

Function.prototype.after = function(afterfn) {
  const self = this;
  return function(args) {
    const result = self.apply(this, args);
    afterfn.apply(this, args);
    return result;
  };
};
