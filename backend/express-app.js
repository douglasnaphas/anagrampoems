const express = require("express");

const app = express();

app.get("/hello", (req, res) => {
  res.send("Hello from Express on AWS Lambda!");
});

module.exports = app;
