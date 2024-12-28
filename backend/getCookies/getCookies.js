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
const getPostLoginURI = require("./getPostLoginURI");
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
  checkQueryParams(["code"]),
  validateQueryCode,
  getCognitoClientSecret(awsSdk),
  exchangeCodeForTokens(axios, Configs),
  getAPJwksFromAws(axios),
  checkJwt({ jwk2Pem, jwt, tokenType: "id", verifyJwt, refreshAccessToken }),
  getUserInfo(jwt),
  getPostLoginURI(),
  generateOpaqueCookie({ randomCapGenerator }),
  setLoginCookie(),
  dbParamsPutLoginCookieInfo(),
  runPut(awsSdk, "dbParamsPutLoginCookieInfo"),
  dbParamsSaveUserTokenInfo(),
  runPut(awsSdk, "dbParamsSaveUserTokenInfo"),
  (req, res, next) => {
    return res.redirect(res.locals.postLoginURI);
  },
];
module.exports = getCookies;
