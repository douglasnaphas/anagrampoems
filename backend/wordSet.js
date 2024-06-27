const wordSet = (key, wordMap) => {
  const alphabet = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    i: 8,
    j: 9,
    k: 10,
    l: 11,
    m: 12,
    n: 13,
    o: 14,
    p: 15,
    q: 16,
    r: 17,
    s: 18,
    t: 19,
    u: 20,
    v: 21,
    w: 22,
    x: 23,
    y: 24,
    z: 25,
  };
  const keyLetters = Array.from(key).reduce((letters, letter) => {
    letters[alphabet[letter]]++;
    return letters;
  }, new Array(26).fill(0));
  const set = new Set();
  lettersLoop: for (const [word, wordLetters] of Object.entries(wordMap)) {
    alphabetLoop: for (let l = 0; l < 26; l++) {
      // check to see if we can make wordLetters from keyLetters
      if (wordLetters[l] > keyLetters[l]) {
        // a required letter is missing
        continue lettersLoop; // go to the next word
      }
    }
    // we've checked all the letters
    set.add(word);
  }
  return set;
};
module.exports = wordSet;
