const checkKeyMiddleware = (req, res, next) => {
  if (req.body && req.body.key && req.body.key.includes("#")) {
    return res.status(400).send("Key contains invalid character: #");
  }
  return next();
};

module.exports = checkKeyMiddleware;
