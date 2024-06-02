const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("/ from Express on AWS Lambda!");
});

app.get("/hello", (req, res) => {
  res.send("Hello from Express on AWS Lambda!");
});

module.exports = app;
