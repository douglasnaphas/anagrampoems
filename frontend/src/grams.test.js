import {
  grams,
  fgrams,
  kMinusF,
  getFrequency,
  canSubtract,
  subtractFreq,
  isEmpty,
} from "./grams";

// Helper to normalize an array of arrays into a Set of sorted JSON strings for comparison
function normalizeList(listOfLists) {
  return new Set(listOfLists.map((sub) => JSON.stringify([...sub].sort())));
}

test('grams function with k = "kate"', () => {
  const k = "kate";
  const vocab = ["a", "k", "t", "e", "at", "eat", "take"];
  const expected = [
    ["take"],
    ["eat", "k"],
    ["at", "k", "e"],
    ["k", "a", "t", "e"],
  ];
  const result = grams(k, vocab);
  expect(normalizeList(result)).toEqual(normalizeList(expected));
});

test('grams2 function with k = "kate"', () => {
  // This test is equivalent to the grams test above.
  const k = "kate";
  const vocab = ["a", "k", "t", "e", "at", "eat", "take"];
  const expected = [
    ["take"],
    ["eat", "k"],
    ["at", "k", "e"],
    ["k", "a", "t", "e"],
  ];
  const result = grams(k, vocab);
  expect(normalizeList(result)).toEqual(normalizeList(expected));
});

// Parameterized tests for fgrams
describe("fgrams parameterized tests", () => {
  test.each([
    {
      description: "Filter with ['take'] - only combinations containing 'take'",
      k: "kate",
      vocab: ["a", "k", "t", "e", "at", "eat", "take"],
      f: ["take"],
      expected: [["take"]],
    },
    {
      description: "Filter with ['eat'] - only combinations containing 'eat'",
      k: "kate",
      vocab: ["a", "k", "t", "e", "at", "eat", "take"],
      f: ["eat"],
      expected: [["eat", "k"]],
    },
    {
      description: "No filter should return the empty list",
      k: "kate",
      vocab: ["a", "k", "t", "e", "at", "eat", "take"],
      f: [],
      expected: [],
    },
  ])("fgrams parameterized test: $description", ({ k, vocab, f, expected }) => {
    const result = fgrams(k, vocab, f);
    expect(normalizeList(result)).toEqual(normalizeList(expected));
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

import { flgrams } from "./grams";

describe("flgrams (with real limiting)", () => {
  it("stops after lim entries", () => {
    const k = "react";
    const vocab = ["act", "cat", "tac"];
    const f = ["re"];
    const lim = 2;

    // Removing 're' from 'react' leaves 'act'
    // Possible grams on 'act' are ['act'], ['cat'], ['tac']
    // In lex order (vocab sorted): act, cat, tac
    // So flgrams yields:
    //   ['act','re']
    //   ['cat','re']
    //   ['tac','re']
    // but with lim=2 we only get the first two.

    const result = flgrams(k, vocab, f, lim);

    expect(result).toEqual([
      ["act", "re"],
      ["cat", "re"],
    ]);
    expect(result).toHaveLength(lim);
  });
});

describe("flsgrams", () => {
  test("navigating the grid of possible grams", () => {
    const vocab = [
      "alpha",
      "bravo",
      "charlie",
      "delta",
    ];
    const expected = [
        {"alpha": 1}, {"alpha": 2}, {"alpha": 3},
        {"bravo": 1},
        {"bravo": 1, "alpha": 1}, {"bravo": 1, "alpha": 2}, {"bravo": 1, "alpha": 3},
        {"bravo": 2},
        {"bravo": 2, "alpha": 1}, {"bravo": 2, "alpha": 2}, {"bravo": 2, "alpha": 3},
        {"bravo": 3},
        {"bravo": 3, "alpha": 1}, {"bravo": 3, "alpha": 2}, {"bravo": 3, "alpha": 3},
        {"charlie": 1},
        {"charlie": 1, "alpha": 1}, {"charlie": 1, "alpha": 2}, {"charlie": 1, "alpha": 3},
        {"charlie": 1, "bravo": 1},
        {"charlie": 1, "bravo": 1, "alpha": 1}, {"charlie": 1, "bravo": 1, "alpha": 2}, {"charlie": 1, "bravo": 1, "alpha": 3},
        
    ];

  });
});
