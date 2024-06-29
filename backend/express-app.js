const express = require("express");
const app = express();
const router = express.Router();
const firstWord = require("./firstWord");
const words = require("./words");
const commonWords = require("./commonWords");

router.get("/", (req, res) => {
  return res.send("/ from Express on AWS Lambda!");
});
router.get("/hello", (req, res) => {
  return res.send("Hello from Express on AWS Lambda!");
});
router.get("/first-word", firstWord);
router.get("/words", words);
app.use("/backend", router);

module.exports = app;
