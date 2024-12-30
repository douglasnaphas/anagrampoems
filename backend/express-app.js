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
router.use(cookieParser());
router.use(validateLoginCookie);
router.use(getDBLoginCookie());
// ^^ sets res.locals.username, user_email, loginCookie
router.get("/whoami", whoami);
router.get("logout", logout);
router.use(bodyParser.urlencoded({ extended: true }));
router.post("/poems", postPoems);
router.get("/poems", getPoems);
app.use("/backend", router);

module.exports = app;
