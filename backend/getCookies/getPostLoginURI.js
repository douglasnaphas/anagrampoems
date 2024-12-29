const getPostLoginURI = () => {
  const middleware = (req, res, next) => {
    res.locals.postLoginURI = "/?";
    res.locals.postLoginURI =
      res.locals.postLoginURI +
      `username=${encodeURIComponent(
        res.locals["cognito:username"]
      )}&email=${encodeURIComponent(res.locals.email)}` +
      "#/logging-in";
    return next();
  };
  return middleware;
};
module.exports = getPostLoginURI;
