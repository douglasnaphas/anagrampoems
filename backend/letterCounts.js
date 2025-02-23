/**
 * Converts a string into a size-26 array, where each position in the array
 * corresponds to the number of occurrences of the corresponding letter in the string.
 * @param {string} str - The input string.
 * @returns {number[]} - The size-26 array representing letter occurrences.
 */
const letterCounts = (str) => {
  const result = new Array(26).fill(0);
  for (const char of str.toLowerCase()) {
    const index = char.charCodeAt(0) - 97; // 'a' is 97 in ASCII
    if (index >= 0 && index < 26) {
      result[index]++;
    }
  }
  return result;
};

module.exports = letterCounts;
