import {
  grams,
  fgrams,
  kMinusF,
  getFrequency,
  canSubtract,
  subtractFreq,
  isEmpty,
} from "./grams";

// Helper to compare two sets of arrays (order-insensitive)
function setEquals(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (const arrA of setA) {
    let foundEqual = false;
    for (const arrB of setB) {
      const sortedA = [...arrA].sort().join(",");
      const sortedB = [...arrB].sort().join(",");
      if (sortedA === sortedB) {
        foundEqual = true;
        break;
      }
    }
    if (!foundEqual) return false;
  }
  return true;
}

test('grams function with k = "kate"', () => {
  const k = "kate";
  const vocab = ["a", "k", "t", "e", "at", "eat", "take"];
  const expected = new Set();
  expected.add(["take"]);
  expected.add(["eat", "k"]);
  expected.add(["at", "k", "e"]);
  expected.add(["k", "a", "t", "e"]);

  const result = grams(k, vocab);
  expect(setEquals(result, expected)).toBe(true);
});

test('grams2 function with k = "kate"', () => {
  const k = "kate";
  const vocab = ["a", "k", "t", "e", "at", "eat", "take"];
  const expected = new Set();
  expected.add(["take"]);
  expected.add(["eat", "k"]);
  expected.add(["at", "k", "e"]);
  expected.add(["k", "a", "t", "e"]);

  const result = grams(k, vocab);
  expect(setEquals(result, expected)).toBe(true);
});

// Parameterized tests for grams2
describe("grams2 parameterized tests", () => {
  // Helper to convert a set of sets (or arrays) into a normalized set of strings for comparison
  function normalizeSet(setOfSets) {
    const normalized = new Set();
    for (const subset of setOfSets) {
      // If subset is a Set, convert to array; if already an array, leave it be.
      const arr = subset instanceof Set ? Array.from(subset) : subset;
      normalized.add(JSON.stringify(arr.sort()));
    }
    return normalized;
  }

  test.each([
    {
      description: "Filter with ['take'] - only combinations containing 'take'",
      k: "kate",
      vocab: ["a", "k", "t", "e", "at", "eat", "take"],
      f: ["take"],
      expected: new Set([new Set(["take"])]),
    },
    {
      description: "Filter with ['eat'] - only combinations containing 'eat'",
      k: "kate",
      vocab: ["a", "k", "t", "e", "at", "eat", "take"],
      f: ["eat"],
      expected: new Set([new Set(["eat", "k"])]),
    },
    {
      description: "No filter should return the empty set",
      k: "kate",
      vocab: ["a", "k", "t", "e", "at", "eat", "take"],
      f: [],
      expected: new Set(),
    },
  ])("fgrams parameterized test: $description", ({ k, vocab, f, expected }) => {
    const result = fgrams(k, vocab, f);
    // Normalize both expected and result for comparison
    const normalizedResult = normalizeSet(result);
    const normalizedExpected = normalizeSet(expected);
    expect(normalizedResult).toEqual(normalizedExpected);
  });
});

// Parameterized tests for kMinusF
describe("kMinusF parameterized tests", () => {
  test.each([
    {
      description: "Remove ['at'] from 'kate' yields 'ke'",
      k: "kate",
      f: ["at"],
      expected: "ke",
    },
    {
      description: "Remove ['k'] from 'kate' yields 'ate'",
      k: "kate",
      f: ["k"],
      expected: "ate",
    },
    {
      description: "Remove ['t', 'e'] from 'kate' yields 'ka'",
      k: "kate",
      f: ["t", "e"],
      expected: "ka",
    },
    {
      description: "Remove ['take'] from 'kate' yields empty string",
      k: "kate",
      f: ["take"],
      expected: "",
    },
  ])("kMinusF parameterized test: $description", ({ k, f, expected }) => {
    const result = kMinusF(k, f);
    expect(result).toBe(expected);
  });
});
