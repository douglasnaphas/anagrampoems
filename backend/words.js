const fs = require("fs");
const path = require("path");
const wordSet = require("./wordSet");

const words = (req, res, next) => {
  if (!req.query || req.query.length > 100) {
    return res.status(400).send("bad request");
  }
  const filePath = path.join(__dirname, "words_alpha.json");

  let data;
  try {
    data = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    return next(err); // Pass the error to the next middleware
  }

  const wordMap = data.split("\n"); // ["word":[0,0,0,1,...],...]
  return res.send(Array.from(wordSet(req.query["word"], wordMap)));
};

module.exports = words;
