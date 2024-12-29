const fs = require("fs");
const path = require("path");
const wordSet = require("./wordSet");

const manyWords = (req, res, next) => {
  const { key } = req.query;
  if (!key || key.length > 100) {
    return res.status(400).send("bad request");
  }
  const filePath = path.join(__dirname, "words_alpha.json");
  let wordsFileContents;
  try {
    wordsFileContents = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    return next(err); // Pass the error to the next middleware
  }
  const wordMap = JSON.parse(wordsFileContents); // {"word":[0,0,0,1,...],...}
  return res.send(Array.from(wordSet(key, wordMap)));
};
module.exports = manyWords;
