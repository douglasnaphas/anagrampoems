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
  const finalResult = Array.from(uniqueCombos).map((comboStr) => JSON.parse(comboStr));
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

export {
  grams,
  fgrams,
  kMinusF,
  getFrequency,
  canSubtract,
  subtractFreq,
  isEmpty,
};
