module.exports = function (source) {
  if (this.resourcePath.includes("sql.js")) {
    return source.replace(
      '"undefined"!=typeof module&&(module.exports=f)',
      'void 0'
    );
  }
  return source;
};
