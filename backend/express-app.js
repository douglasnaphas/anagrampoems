const express = require("express");

const app = express();

app.use("*", (req, res, next) => {
  console.log("received a request");
  console.log(req);
  return next();
});

app.get("/", (req, res) => {
  return res.send("/ from Express on AWS Lambda!");
});

app.get("/hello", (req, res) => {
  return res.send("Hello from Express on AWS Lambda!");
});

module.exports = app;
