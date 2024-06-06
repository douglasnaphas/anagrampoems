const express = require("express");
const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  return res.send("/ from Express on AWS Lambda!");
});
router.get("/hello", (req, res) => {
  return res.send("Hello from Express on AWS Lambda!");
});
app.use("/backend", router);

module.exports = app;
