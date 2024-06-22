const express = require("express");
const app = express();
const router = express.Router();
const firstWord = require("./firstWord");

router.get("/", (req, res) => {
  return res.send("/ from Express on AWS Lambda!");
});
router.get("/hello", (req, res) => {
  return res.send("Hello from Express on AWS Lambda!");
});
router.get("/first-word", firstWord);
app.use("/backend", router);

module.exports = app;
