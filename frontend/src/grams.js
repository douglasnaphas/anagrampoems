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
  const result = new Set();
  const targetFreq = getFrequency(k);
  // Precompute frequency for each word in vocab
  const vocabData = vocab.map((word) => [word, getFrequency(word)]);

  function backtrack(currentCombo, remainingFreq) {
    if (isEmpty(remainingFreq)) {
      // Canonically sort the combination so order doesn't matter
      const sortedCombo = [...currentCombo].sort();
      result.add(JSON.stringify(sortedCombo));
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
  // Convert JSON strings back into arrays and return as a new Set
  const finalResult = new Set();
  for (const comboStr of result) {
    finalResult.add(JSON.parse(comboStr));
  }
  return finalResult;
}

function fgrams(k, vocab, f) {
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
  // Add each word in `f` to each combination in `subGrams`
  // const result = new Set();
  // // for each word in f
  // for(const word of f){
  //   // for each combination in subGrams
  //   for(const combo of subGrams){
  //     // add the word to the combination
  //     const newCombo = [...combo, word];
  //     // add the new combination to the result set
  //     result.add(newCombo);
  //   }
  // }
  
  const result = grams(k, vocab);
  const filteredResult = new Set();

  for (const combo of result) {
    // Check if any word in the combination is in the filter set
    if (combo.some((word) => f.includes(word))) {
      filteredResult.add(combo);
    }
  }

  return filteredResult;
}

export { grams, fgrams, kMinusF, getFrequency, canSubtract, subtractFreq, isEmpty };
