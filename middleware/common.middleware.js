module.exports.getRequestTime = (req, res, next) => {
  req.requestTime = new Date().toLocaleString();
  next();
};
