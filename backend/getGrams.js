const words = require("./words_alpha-union-google-10000-english-usa.json");
const { letters, countAContainsCountB, aContainsB } = require("./letters");

const getGrams = (req, res) => {
  console.log("getGrams, req.query:", req.query);
  const letterCount = req.query.letterCount;
  if (
    !letterCount ||
    !Array.isArray(letterCount) ||
    letterCount.length !== 26
  ) {
    return res.status(400).send("Invalid letter count format");
  }
  console.log("getGrams, have letterCount array");
  const validWords = words.filter((word) =>
    countAContainsCountB(letterCount, letters(word))
  );
  const anagrams = findAnagrams(validWords, letterCount);

  return res.send(anagrams);
};

const findAnagrams = (words, letterCount) => {
  console.log("findAnagrams, words:", words);
  const results = [];
  const used = new Array(words.length).fill(false);

  const backtrack = (current, remaining) => {
    if (remaining.every((count) => count === 0)) {
      results.push(current.slice());
      return;
    }

    for (let i = 0; i < words.length; i++) {
      if (used[i]) continue;
      const word = words[i];
      const wordLetters = letters(word);
      if (countAContainsCountB(remaining, wordLetters)) {
        used[i] = true;
        const newRemaining = remaining.map(
          (count, index) => count - wordLetters[index]
        );
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

/**
 *
 * @param {*} vocab
 * @param {*} keyLetterCount
 * @returns
 */
const grams = (vocab, keyLetterCount) => {
  // vocab looks like { "word": [0, 0, 0, 1, ...], ... }
  // iterate over each word in vocab
  for (w in vocab) {
    if (!countAContainsCountB(keyLetterCount, vocab[w])) {
      throw new Error("a word in vocab cannot be formed from key");
    }
  }
  // every word in vocab can be formed from key
  const ret = [];
  // iterate over each word in vocab
  for (v in vocab) {
    // Add to ret v + grams that can be formed from key - v
    const keyLetterCountMinusVLetterCount = keyLetterCount.map(
      (c, i) => c - vocab[v][i]
    );
    // const vocabMinusV = countAContainsCountB(
    //   keyLetterCountMinusVLetterCount,
    //   vocab[v]
    // )
    //   ? vocab
    //   : Object.fromEntries(Object.entries(vocab).filter(([k, _]) => k !== v));
    /*Object.assign({}, vocab, { [v]: undefined });*/
    const vocabMinusV = Object.fromEntries(
      Object.entries(vocab).filter(([_, c]) =>
        countAContainsCountB(keyLetterCountMinusVLetterCount, c)
      )
    );
    for (g in grams(vocabMinusV, keyLetterCountMinusVLetterCount)) {
      ret.push([v, g]);
    }
  }
  return ret;
};

module.exports = { getGrams, findAnagrams, grams };
