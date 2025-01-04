const words = require("./words_alpha-union-google-10000-english-usa.json");
const { letters, aContainsB } = require("./letters");

const getGrams = (req, res) => {
  const letterCount = req.query.letterCount;
  if (!letterCount || !Array.isArray(letterCount) || letterCount.length !== 26) {
    return res.status(400).send("Invalid letter count format");
  }

  const validWords = words.filter(word => aContainsB(letterCount, letters(word)));
  const anagrams = findAnagrams(validWords, letterCount);

  return res.json(anagrams);
};

const findAnagrams = (words, letterCount) => {
  const results = [];
  const used = new Array(words.length).fill(false);

  const backtrack = (current, remaining) => {
    if (remaining.every(count => count === 0)) {
      results.push(current.slice());
      return;
    }

    for (let i = 0; i < words.length; i++) {
      if (used[i]) continue;
      const word = words[i];
      const wordLetters = letters(word);
      if (aContainsB(remaining, wordLetters)) {
        used[i] = true;
        const newRemaining = remaining.map((count, index) => count - wordLetters[index]);
        current.push(word);
        backtrack(current, newRemaining);
        current.pop();
        used[i] = false;
      }
    }
  };

  backtrack([], letterCount);
  return results;
};

module.exports = getGrams;
