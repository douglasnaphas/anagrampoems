const express = require("express");

const app = express();

app.get("/", (req, res) => {
  return res.send("/ from Express on AWS Lambda!");
});

app.get("/hello", (req, res) => {
  return res.send("Hello from Express on AWS Lambda!");
});

module.exports = app;
