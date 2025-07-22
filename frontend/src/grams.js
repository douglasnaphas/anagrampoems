/*
  vocab is always the full vocabulary of words. Callers must not remove filter
  words from vocab before calling a grams function.

  Callers should lowercase every input word before calling these functions.

  Callers are responsible for sorting vocab before providing it as input.

  Sort vocab in ascending order by length for best results. Break ties any way.
*/

function getFrequency(word) {
  const freq = {};
  for (const char of word) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}

function canSubtract(freq, wordFreq) {
  for (const char in wordFreq) {
    if (!freq[char] || freq[char] < wordFreq[char]) {
      return false;
    }
  }
  return true;
}

function subtractFreq(freq, wordFreq) {
  const newFreq = { ...freq };
  for (const char in wordFreq) {
    newFreq[char] -= wordFreq[char];
    if (newFreq[char] === 0) {
      delete newFreq[char];
    }
  }
  return newFreq;
}

function isEmpty(freq) {
  return Object.keys(freq).length === 0;
}

/**
 * Subtracts the letters in the array of words `f` from the word `k`, preserving order.
 * @param {string} k - The original word.
 * @param {string[]} f - Array of words whose letters should be removed from `k`.
 * @returns {string} The remainder of `k` after removing all letters in `f`.
 */
function kMinusF(k, f) {
  // Build a map of how many of each character to remove
  const removeCounts = {};
  for (const word of f) {
    for (const ch of word) {
      removeCounts[ch] = (removeCounts[ch] || 0) + 1;
    }
  }

  // Walk through k, skipping chars that still need to be removed
  let result = "";
  for (const ch of k) {
    if (removeCounts[ch] > 0) {
      removeCounts[ch]--;
      // skip this character
    } else {
      result += ch;
    }
  }

  return result;
}

function grams(k, vocab) {
  const uniqueCombos = new Set();
  const targetFreq = getFrequency(k);
  const vocabData = vocab.map((word) => [word, getFrequency(word)]);

  function backtrack(currentCombo, remainingFreq) {
    if (isEmpty(remainingFreq)) {
      // Canonically sort the combination so order doesn't matter
      const sortedCombo = [...currentCombo].sort();
      uniqueCombos.add(JSON.stringify(sortedCombo));
      return;
    }
    for (const [word, wordFreq] of vocabData) {
      if (canSubtract(remainingFreq, wordFreq)) {
        currentCombo.push(word);
        const newRemaining = subtractFreq(remainingFreq, wordFreq);
        backtrack(currentCombo, newRemaining);
        currentCombo.pop();
      }
    }
  }

  backtrack([], targetFreq);
  // Convert JSON strings back into arrays and return as an array of arrays.
  const finalResult = Array.from(uniqueCombos).map((comboStr) =>
    JSON.parse(comboStr)
  );
  return finalResult;
}

function fgrams(k, vocab, f) {
  if (f.length === 0) {
    return [];
  }
  const k2 = kMinusF(k, f);
  const fk2 = f.reduce((acc, word) => {
    const wordFreq = getFrequency(word);
    for (const char in wordFreq) {
      acc[char] = acc[char] - wordFreq[char];
    }
    return acc;
  }, getFrequency(k));
  const vocab2 = vocab.reduce((acc, word) => {
    const wordFreq = getFrequency(word);
    if (canSubtract(fk2, wordFreq)) {
      acc.push(word);
    }
    return acc;
  }, []);
  const subGrams = grams(k2, vocab2);
  // For each combination, add the filter words and return an array
  const result = subGrams.map((combo) => [...combo, ...f]);
  return result;
}

/**
 * Like fgrams, but returns at most `lim` combinations in lex order.
 * Ordering: treat each combination as a sorted list of words and compare lexicographically.
 */
function flgrams(k, vocab, f, lim) {
  if (f.length === 0 || lim <= 0) return [];
  // Remainder after removing filter words
  const k2 = kMinusF(k, f);
  const freqK2 = getFrequency(k2);
  // Only words that fit, sorted lexicographically
  const vocab2 = vocab
    .filter((word) => canSubtract(freqK2, getFrequency(word)))
    .sort();

  const results = [];
  function backtrack(startIdx, combo, remFreq) {
    if (results.length >= lim) return true; // stop early
    if (isEmpty(remFreq)) {
      results.push([...combo, ...f]);
      return results.length >= lim;
    }
    for (let i = startIdx; i < vocab2.length; i++) {
      const word = vocab2[i];
      const wf = getFrequency(word);
      if (!canSubtract(remFreq, wf)) continue;
      combo.push(word);
      const newRem = subtractFreq(remFreq, wf);
      const done = backtrack(i, combo, newRem);
      combo.pop();
      if (done) return true;
    }
    return false;
  }

  backtrack(0, [], freqK2);
  return results;
}

/**
 * Finds all valid combinations of words from the vocabulary that can be formed
 * from the letters in the input string `k`, while also considering the filter
 * words `f` and limiting the number of results to `lim`. Starts after the gram
 * given by `start`.
 * @param {*} k The key, the string being anagrammed.
 * @param {*} vocab The vocabulary of words to use for forming combinations.
 * @param {*} f A list of words from `vocab` which must be in all grams.
 *   Example: `["animal", "lover"]`.
 * @param {*} lim The maximum number of combinations to return example: `10`.
 * @param {*} start A gram to start after, example: `"his wrath at"`.
 * @param {*} fits A function fits(small, big) -> boolean.
 *   `small` is the candidate gram, example: `{"alpha": 1, "bravo": 2}`
 *   `big` is the key, example: `"alpha bravo bravo charlie"`
 * @param {*} nextCombo A function that returns the next combination of vocab
 *   words to operate on. nextCombo(thisCombo, vocab) -> combo. `combo`, `thisCombo`
 *   example: {"alpha": 1, "bravo": 2}
 *   Maybe this should be defined in the function, since I always want to
 *   progress through gram candidates in the same order.
 *   Or maybe nextCombo should contain the gram-checking logic?
 *   Or maybe nextCombo should take fits as an arg?
 */
function flsgrams(k, vocab, f, lim, start) {
  const ret = [];
  /*
    Maybe nextCombo's algo should be:
      For the word that I'm on (how do I know that? From the loop index?), if I
      can increment it based on fits(), then do it, otherwise, increase the
      index. Maybe the index is in some kind of inner loop? What's the outer
      loop?
    
    I think the outer loop is a combo, a candidate gram. The inner loop is over
    the vocab.
  */
  const nextCombo = (thisCombo) => {

  }

  // Remove the filter words from k and vocab
  if (f.length === 0 || lim <= 0) return [];
  // Remainder after removing filter words
  const k2 = kMinusF(k, f);
  const freqK2 = getFrequency(k2);
  // Only words that fit
  const vocab2 = vocab
    .filter((word) => canSubtract(freqK2, getFrequency(word)));

  
  return ret;
}

/**
 * 
 * @param {*} k 
 * @param {*} vocab 
 * @param {*} thisCombo 
 * @param {*} i
 * @return {*} thisCombo with the lowest possible order increment made, of 1
 */
function nextCombo(k, vocab, thisCombo, i) {
  // base case: thisCombo falsy
  if(!thisCombo) {
    return {[vocab[i]]: 1};
  }

  // base case: can increment, based on canSubtract
  const freq = getFrequency(k);
  let candidate = {...thisCombo, [vocab[i]]: (thisCombo[vocab[i]] || 0) + 1};
  console.log(candidate);
  const candidateFreq = candidate => {
    let candidateWord = "";
    // iterate over the keys in candidate
    for (const word in candidate) {
      candidateWord += word.repeat(candidate[word]);
    }
    return getFrequency(candidateWord);
  }
  if (canSubtract(freq, candidateFreq(candidate))) {
    console.log(`can subtract ${candidate} from ${freq}`);
    return candidate;
  }

}

export {
  grams,
  fgrams,
  flgrams,
  flsgrams,
  nextCombo,
  kMinusF,
  getFrequency,
  canSubtract,
  subtractFreq,
  isEmpty,
};
