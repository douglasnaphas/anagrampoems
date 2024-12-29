const Configs = require("./Configs");
const validateLoginCookie = (req, res, next) => {
  if(!req.cookies[Configs.loginCookieName()]) {
    return res.status(401).send("No login cookie");
  }
  // Send 401 if the cookie contains invalid characters
  if(/[^A-Z]/.test(req.cookies[Configs.loginCookieName()])) {
    return res.status(401).send("Invalid login cookie");
  }
  return next();
};

module.exports = validateLoginCookie;
