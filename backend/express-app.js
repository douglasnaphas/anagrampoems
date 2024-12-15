const express = require("express");
const app = express();
const router = express.Router();
const firstWord = require("./firstWord");
const words = require("./words");
const commonWords = require("./commonWords");
const login = require("./login");

router.get("/", (req, res) => {
  return res.send("/ from Express on AWS Lambda!");
});
router.get("/hello", (req, res) => {
  return res.send("Hello from Express on AWS Lambda!");
});
router.get("/first-word", firstWord);
router.get("/words", words);
router.get("/common-words", commonWords);
router.get("/login", login);
app.use("/backend", router);

module.exports = app;
