const checkQueryParams = require("../checkQueryParams");
const validateQueryCode = require("./validateQueryCode");
const getCognitoClientSecret = require("./getCognitoClientSecret");
const exchangeCodeForTokens = require("./exchangeCodeForTokens");
const axios = require("axios");
const getAPJwksFromAws = require("./getAPJwksFromAws");
const jwk2Pem = require("jwk-to-pem");
const checkJwt = require("./checkJwt");
const jwt = require("jsonwebtoken");
const getUserInfo = require("./getUserInfo");
const Configs = require("../Configs");
const dbParamsSaveUserTokenInfo = require("./dbParamsSaveUserTokenInfo");
const runPut = require("./runPut");
const verifyJwt = require("./verifyJwt");
const refreshAccessToken = require("./refreshAccessToken");
const randomCapGenerator = require("./randomCapGenerator");
const generateOpaqueCookie = require("./generateOpaqueCookie");
const setLoginCookie = require("./setLoginCookie");
const dbParamsPutLoginCookieInfo = require("./dbParamsPutLoginCookieInfo");

const getCookies = [
  (req, res, next) => {
    console.log("GET /get-cookies");
    return next();
  },
  checkQueryParams(["code"]),
  validateQueryCode,
  getCognitoClientSecret(),
  exchangeCodeForTokens(axios, Configs),
  getAPJwksFromAws(axios),
  checkJwt({ jwk2Pem, jwt, tokenType: "id", verifyJwt, refreshAccessToken }),
  getUserInfo(jwt),
  generateOpaqueCookie({ randomCapGenerator }),
  setLoginCookie(),
  dbParamsPutLoginCookieInfo(),
  runPut("dbParamsPutLoginCookieInfo"),
  dbParamsSaveUserTokenInfo(),
  runPut("dbParamsSaveUserTokenInfo"),
  (req, res, next) => {
    return res.redirect("/");
  },
];
module.exports = getCookies;
