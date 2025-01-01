const express = require("express");
const app = express();
const router = express.Router();
exports.router = router;
const firstWord = require("./firstWord");
const words = require("./words");
const commonWords = require("./commonWords");
const manyWords = require("./manyWords");
const login = require("./login");
const getCookies = require("./getCookies/getCookies");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const Configs = require("./Configs");
const validateLoginCookie = require("./validateLoginCookie");
const getDBLoginCookie = require("./getDBLoginCookie");
const whoami = require("./whoami");
const logout = require("./logout");
const postPoems = require("./postPoems");
const getPoems = require("./getPoems");
const getPoem = require("./getPoem");
const getPoemLines = require("./getPoemLines");
const postPoemLines = require("./postPoemLines");
const postLineOrder = require("./postLineOrder");
const putLineWords = require("./putLineWords");
const deletePoems = require("./deletePoems");
const checkKeyMiddleware = require("./checkKeyMiddleware");

router.get("/", (req, res) => {
  return res.send("/ from Express on AWS Lambda!");
});
router.get("/hello", (req, res) => {
  return res.send("Hello from Express on AWS Lambda!");
});
router.get("/first-word", firstWord);
router.get("/words", words);
router.get("/common-words", commonWords);
router.get("/many-words", manyWords);
router.get("/login", login);
router.get("/get-cookies", getCookies);

// authenticated requests
router.use(cookieParser()); // TODO: Does this check cookie expiration?
router.use(validateLoginCookie);
router.use(getDBLoginCookie());
// ^^ sets res.locals.username, user_email, loginCookie
// sends 401 if loginCookie is not found or is logged out
router.get("/whoami", whoami);
router.get("/logout", logout);

// Send a 4xx response if body.key has a # character
router.use(checkKeyMiddleware);

// Use bodyParser.urlencoded for /poems route
router.post("/poems", bodyParser.urlencoded({ extended: true }), postPoems);

// Use bodyParser.json for /poem-lines, /line-order, and /line-words routes
router.post("/poem-lines", bodyParser.json(), postPoemLines);
router.post("/line-order", bodyParser.json(), postLineOrder);
router.put("/line-words", bodyParser.json(), putLineWords);
router.delete("/poems", deletePoems);

router.get("/poems", getPoems);
router.get("/poem", getPoem);
router.get("/poem-lines", getPoemLines);
app.use("/backend", router);

module.exports = app;
