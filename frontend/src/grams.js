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

function grams(k, vocab) {
    const result = new Set();
    const targetFreq = getFrequency(k);
    // Precompute frequency for each word in vocab
    const vocabData = vocab.map(word => [word, getFrequency(word)]);

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

function grams2(k, vocab, f){
    const result = grams(k, vocab);
    const filteredResult = new Set();

    for (const combo of result) {
        // Check if any word in the combination is in the filter set
        if (combo.some(word => f.includes(word))) {
            filteredResult.add(combo);
        }
    }

    return filteredResult;
}

export { grams, grams2 };