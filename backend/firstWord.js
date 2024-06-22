const fs = require("fs");
const path = require("path");

const firstWord = (req, res, next) => {
  const filePath = path.join(__dirname, "words_alpha.txt");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return next(err); // Pass the error to the next middleware
    }

    const words = data.split("\n");
    const firstWord = words[0];

    res.send(firstWord);
  });
};

module.exports = firstWord;
