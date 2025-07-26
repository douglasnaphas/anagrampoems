import { describe, expect } from "vitest";
import {
  grams,
  fgrams,
  flsgrams,
  nextCombo,
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

describe.skip("flsgrams", () => {
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
        {"charlie": 1, "bravo": 2},
        {"charlie": 1, "bravo": 2, "alpha": 1}, {"charlie": 1, "bravo": 2, "alpha": 2}, {"charlie": 1, "bravo": 2, "alpha": 3},
        {"charlie": 1, "bravo": 3},
        {"charlie": 1, "bravo": 3, "alpha": 1}, {"charlie": 1, "bravo": 3, "alpha": 2}, {"charlie": 1, "bravo": 3, "alpha": 3},
        {"charlie": 2},
        {"charlie": 2, "alpha": 1}, {"charlie": 2, "alpha": 2}, {"charlie": 2, "alpha": 3},
        {"charlie": 2, "bravo": 1},
        {"charlie": 2, "bravo": 1, "alpha": 1}, {"charlie": 2, "bravo": 1, "alpha": 2}, {"charlie": 2, "bravo": 1, "alpha": 3},
        {"charlie": 2, "bravo": 2},
        {"charlie": 2, "bravo": 2, "alpha": 1}, {"charlie": 2, "bravo": 2, "alpha": 2}, {"charlie": 2, "bravo": 2, "alpha": 3},
        {"charlie": 2, "bravo": 3},
        {"charlie": 2, "bravo": 3, "alpha": 1}, {"charlie": 2, "bravo": 3, "alpha": 2}, {"charlie": 2, "bravo": 3, "alpha": 3},
        {"charlie": 3},
        {"charlie": 3, "alpha": 1}, {"charlie": 3, "alpha": 2}, {"charlie": 3, "alpha": 3},
        {"charlie": 3, "bravo": 1},
        {"charlie": 3, "bravo": 1, "alpha": 1}, {"charlie": 3, "bravo": 1, "alpha": 2}, {"charlie": 3, "bravo": 1, "alpha": 3},
        {"charlie": 3, "bravo": 2},
        {"charlie": 3, "bravo": 2, "alpha": 1}, {"charlie": 3, "bravo": 2, "alpha": 2}, {"charlie": 3, "bravo": 2, "alpha": 3},
        {"charlie": 3, "bravo": 3},
        {"charlie": 3, "bravo": 3, "alpha": 1}, {"charlie": 3, "bravo": 3, "alpha": 2}, {"charlie": 3, "bravo": 3, "alpha": 3},
        {"delta": 1},
        {"delta": 1, "alpha": 1}, {"delta": 1, "alpha": 2}, {"delta": 1, "alpha": 3},
        {"delta": 1, "bravo": 1},
        {"delta": 1, "bravo": 1, "alpha": 1}, {"delta": 1, "bravo": 1, "alpha": 2}, {"delta": 1, "bravo": 1, "alpha": 3},
        {"delta": 1, "bravo": 2},
        {"delta": 1, "bravo": 2, "alpha": 1}, {"delta": 1, "bravo": 2, "alpha": 2}, {"delta": 1, "bravo": 2, "alpha": 3},
        {"delta": 1, "bravo": 3},
        {"delta": 1, "bravo": 3, "alpha": 1}, {"delta": 1, "bravo": 3, "alpha": 2}, {"delta": 1, "bravo": 3, "alpha": 3},
        {"delta": 1, "charlie": 1},
        {"delta": 1, "charlie": 1, "alpha": 1}, {"delta": 1, "charlie": 1, "alpha": 2}, {"delta": 1, "charlie": 1, "alpha": 3},
        {"delta": 1, "charlie": 1, "bravo": 1},
        {"delta": 1, "charlie": 1, "bravo": 1, "alpha": 1}, {"delta": 1, "charlie": 1, "bravo": 1, "alpha": 2}, {"delta": 1, "charlie": 1, "bravo": 1, "alpha": 3},
        {"delta": 1, "charlie": 1, "bravo": 2},
        {"delta": 1, "charlie": 1, "bravo": 2, "alpha": 1}, {"delta": 1, "charlie": 1, "bravo": 2, "alpha": 2}, {"delta": 1, "charlie": 1, "bravo": 2, "alpha": 3},
        {"delta": 1, "charlie": 1, "bravo": 3},
        {"delta": 1, "charlie": 1, "bravo": 3, "alpha": 1}, {"delta": 1, "charlie": 1, "bravo": 3, "alpha": 2}, {"delta": 1, "charlie": 1, "bravo": 3, "alpha": 3},
        {"delta": 1, "charlie": 2},
        {"delta": 1, "charlie": 2, "alpha": 1}, {"delta": 1, "charlie": 2, "alpha": 2}, {"delta": 1, "charlie": 2, "alpha": 3},
        {"delta": 1, "charlie": 2, "bravo": 1},
        {"delta": 1, "charlie": 2, "bravo": 1, "alpha": 1}, {"delta": 1, "charlie": 2, "bravo": 1, "alpha": 2}, {"delta": 1, "charlie": 2, "bravo": 1, "alpha": 3},
        {"delta": 1, "charlie": 2, "bravo": 2},
        {"delta": 1, "charlie": 2, "bravo": 2, "alpha": 1}, {"delta": 1, "charlie": 2, "bravo": 2, "alpha": 2}, {"delta": 1, "charlie": 2, "bravo": 2, "alpha": 3},
        {"delta": 1, "charlie": 2, "bravo": 3},
        {"delta": 1, "charlie": 2, "bravo": 3, "alpha": 1}, {"delta": 1, "charlie": 2, "bravo": 3, "alpha": 2}, {"delta": 1, "charlie": 2, "bravo": 3, "alpha": 3},
        {"delta": 1, "charlie": 3},
        {"delta": 1, "charlie": 3, "alpha": 1}, {"delta": 1, "charlie": 3, "alpha": 2}, {"delta": 1, "charlie": 3, "alpha": 3},
        {"delta": 1, "charlie": 3, "bravo": 1},
        {"delta": 1, "charlie": 3, "bravo": 1, "alpha": 1}, {"delta": 1, "charlie": 3, "bravo": 1, "alpha": 2}, {"delta": 1, "charlie": 3, "bravo": 1, "alpha": 3},
        {"delta": 1, "charlie": 3, "bravo": 2},
        {"delta": 1, "charlie": 3, "bravo": 2, "alpha": 1}, {"delta": 1, "charlie": 3, "bravo": 2, "alpha": 2}, {"delta": 1, "charlie": 3, "bravo": 2, "alpha": 3},
        {"delta": 1, "charlie": 3, "bravo": 3},
        {"delta": 1, "charlie": 3, "bravo": 3, "alpha": 1}, {"delta": 1, "charlie": 3, "bravo": 3, "alpha": 2}, {"delta": 1, "charlie": 3, "bravo": 3, "alpha": 3},
        {"delta": 2},
        {"delta": 2, "alpha": 1}, {"delta": 2, "alpha": 2}, {"delta": 2, "alpha": 3},
        {"delta": 2, "bravo": 1},
        {"delta": 2, "bravo": 1, "alpha": 1}, {"delta": 2, "bravo": 1, "alpha": 2}, {"delta": 2, "bravo": 1, "alpha": 3},
        {"delta": 2, "bravo": 2},
        {"delta": 2, "bravo": 2, "alpha": 1}, {"delta": 2, "bravo": 2, "alpha": 2}, {"delta": 2, "bravo": 2, "alpha": 3},
        {"delta": 2, "bravo": 3},
        {"delta": 2, "bravo": 3, "alpha": 1}, {"delta": 2, "bravo": 3, "alpha": 2}, {"delta": 2, "bravo": 3, "alpha": 3},
        {"delta": 2, "charlie": 1},
        {"delta": 2, "charlie": 1, "alpha": 1}, {"delta": 2, "charlie": 1, "alpha": 2}, {"delta": 2, "charlie": 1, "alpha": 3},
        {"delta": 2, "charlie": 1, "bravo": 1},
        {"delta": 2, "charlie": 1, "bravo": 1, "alpha": 1}, {"delta": 2, "charlie": 1, "bravo": 1, "alpha": 2}, {"delta": 2, "charlie": 1, "bravo": 1, "alpha": 3},
        {"delta": 2, "charlie": 1, "bravo": 2},
        {"delta": 2, "charlie": 1, "bravo": 2, "alpha": 1}, {"delta": 2, "charlie": 1, "bravo": 2, "alpha": 2}, {"delta": 2, "charlie": 1, "bravo": 2, "alpha": 3},
        {"delta": 2, "charlie": 1, "bravo": 3},
        {"delta": 2, "charlie": 1, "bravo": 3, "alpha": 1}, {"delta": 2, "charlie": 1, "bravo": 3, "alpha": 2}, {"delta": 2, "charlie": 1, "bravo": 3, "alpha": 3},
        {"delta": 2, "charlie": 2},
        {"delta": 2, "charlie": 2, "alpha": 1}, {"delta": 2, "charlie": 2, "alpha": 2}, {"delta": 2, "charlie": 2, "alpha": 3},
        {"delta": 2, "charlie": 2, "bravo": 1},
        {"delta": 2, "charlie": 2, "bravo": 1, "alpha": 1}, {"delta": 2, "charlie": 2, "bravo": 1, "alpha": 2}, {"delta": 2, "charlie": 2, "bravo": 1, "alpha": 3},
        {"delta": 2, "charlie": 2, "bravo": 2},
        {"delta": 2, "charlie": 2, "bravo": 2, "alpha": 1}, {"delta": 2, "charlie": 2, "bravo": 2, "alpha": 2}, {"delta": 2, "charlie": 2, "bravo": 2, "alpha": 3},
        {"delta": 2, "charlie": 2, "bravo": 3},
        {"delta": 2, "charlie": 2, "bravo": 3, "alpha": 1}, {"delta": 2, "charlie": 2, "bravo": 3, "alpha": 2}, {"delta": 2, "charlie": 2, "bravo": 3, "alpha": 3},
        {"delta": 2, "charlie": 3},
        {"delta": 2, "charlie": 3, "alpha": 1}, {"delta": 2, "charlie": 3, "alpha": 2}, {"delta": 2, "charlie": 3, "alpha": 3},
        {"delta": 2, "charlie": 3, "bravo": 1},
        {"delta": 2, "charlie": 3, "bravo": 1, "alpha": 1}, {"delta": 2, "charlie": 3, "bravo": 1, "alpha": 2}, {"delta": 2, "charlie": 3, "bravo": 1, "alpha": 3},
        {"delta": 2, "charlie": 3, "bravo": 2},
        {"delta": 2, "charlie": 3, "bravo": 2, "alpha": 1}, {"delta": 2, "charlie": 3, "bravo": 2, "alpha": 2}, {"delta": 2, "charlie": 3, "bravo": 2, "alpha": 3},
        {"delta": 2, "charlie": 3, "bravo": 3},
        {"delta": 2, "charlie": 3, "bravo": 3, "alpha": 1}, {"delta": 2, "charlie": 3, "bravo": 3, "alpha": 2}, {"delta": 2, "charlie": 3, "bravo": 3, "alpha": 3},
        {"delta": 3},
        {"delta": 3, "alpha": 1}, {"delta": 3, "alpha": 2}, {"delta": 3, "alpha": 3},
        {"delta": 3, "bravo": 1},
        {"delta": 3, "bravo": 1, "alpha": 1}, {"delta": 3, "bravo": 1, "alpha": 2}, {"delta": 3, "bravo": 1, "alpha": 3},
        {"delta": 3, "bravo": 2},
        {"delta": 3, "bravo": 2, "alpha": 1}, {"delta": 3, "bravo": 2, "alpha": 2}, {"delta": 3, "bravo": 2, "alpha": 3},
        {"delta": 3, "bravo": 3},
        {"delta": 3, "bravo": 3, "alpha": 1}, {"delta": 3, "bravo": 3, "alpha": 2}, {"delta": 3, "bravo": 3, "alpha": 3},
        {"delta": 3, "charlie": 1},
        {"delta": 3, "charlie": 1, "alpha": 1}, {"delta": 3, "charlie": 1, "alpha": 2}, {"delta": 3, "charlie": 1, "alpha": 3},
        {"delta": 3, "charlie": 1, "bravo": 1},
        {"delta": 3, "charlie": 1, "bravo": 1, "alpha": 1}, {"delta": 3, "charlie": 1, "bravo": 1, "alpha": 2}, {"delta": 3, "charlie": 1, "bravo": 1, "alpha": 3},
        {"delta": 3, "charlie": 1, "bravo": 2},
        {"delta": 3, "charlie": 1, "bravo": 2, "alpha": 1}, {"delta": 3, "charlie": 1, "bravo": 2, "alpha": 2}, {"delta": 3, "charlie": 1, "bravo": 2, "alpha": 3},
        {"delta": 3, "charlie": 1, "bravo": 3},
        {"delta": 3, "charlie": 1, "bravo": 3, "alpha": 1}, {"delta": 3, "charlie": 1, "bravo": 3, "alpha": 2}, {"delta": 3, "charlie": 1, "bravo": 3, "alpha": 3},
        {"delta": 3, "charlie": 2},
        {"delta": 3, "charlie": 2, "alpha": 1}, {"delta": 3, "charlie": 2, "alpha": 2}, {"delta": 3, "charlie": 2, "alpha": 3},
        {"delta": 3, "charlie": 2, "bravo": 1},
        {"delta": 3, "charlie": 2, "bravo": 1, "alpha": 1}, {"delta": 3, "charlie": 2, "bravo": 1, "alpha": 2}, {"delta": 3, "charlie": 2, "bravo": 1, "alpha": 3},
        {"delta": 3, "charlie": 2, "bravo": 2},
        {"delta": 3, "charlie": 2, "bravo": 2, "alpha": 1}, {"delta": 3, "charlie": 2, "bravo": 2, "alpha": 2}, {"delta": 3, "charlie": 2, "bravo": 2, "alpha": 3},
        {"delta": 3, "charlie": 2, "bravo": 3},
        {"delta": 3, "charlie": 2, "bravo": 3, "alpha": 1}, {"delta": 3, "charlie": 2, "bravo": 3, "alpha": 2}, {"delta": 3, "charlie": 2, "bravo": 3, "alpha": 3},
        {"delta": 3, "charlie": 3},
        {"delta": 3, "charlie": 3, "alpha": 1}, {"delta": 3, "charlie": 3, "alpha": 2}, {"delta": 3, "charlie": 3, "alpha": 3},
        {"delta": 3, "charlie": 3, "bravo": 1},
        {"delta": 3, "charlie": 3, "bravo": 1, "alpha": 1}, {"delta": 3, "charlie": 3, "bravo": 1, "alpha": 2}, {"delta": 3, "charlie": 3, "bravo": 1, "alpha": 3},
        {"delta": 3, "charlie": 3, "bravo": 2},
        {"delta": 3, "charlie": 3, "bravo": 2, "alpha": 1}, {"delta": 3, "charlie": 3, "bravo": 2, "alpha": 2}, {"delta": 3, "charlie": 3, "bravo": 2, "alpha": 3},
        {"delta": 3, "charlie": 3, "bravo": 3},
        {"delta": 3, "charlie": 3, "bravo": 3, "alpha": 1}, {"delta": 3, "charlie": 3, "bravo": 3, "alpha": 2}, {"delta": 3, "charlie": 3, "bravo": 3, "alpha": 3}
    ];
    expect(expected.length).toBe(255);
    const k = "placeholder";
    const f = ["place", "holder"];
    const lim = 300;
    const start = "placeholder";
    const nextCombo = (combo, vocab) => {
      
    }
    const fits = (small, big) => {
      for(let i = 0; i < vocab.length; i++) {
        if(small[vocab[i]]) {
          // Placeholder logic, should return true/false as needed
        }
      }
      // Placeholder return value
      return true;
    };
    const actual = flsgrams(k, vocab, f, lim, start, fits);
    
    expect({"a": 5, "b": 6}).toEqual({"b": 6, "a": 5});
    expect(actual.length).toBe(expected.length);
    expected.forEach((gram, i) => {
      expect(actual[i]).toEqual(gram);
    });
  });
  test("simple case, lim 1", () => {
    const k = "aabbcc";
    const vocab = ["aa", "bb", "bc", "cc"];
    const f = ["aa", "bb", "cc"];
    const lim = 1;
    const start = undefined;
    const expected = [
      {"aa": 1, "bb": 1, "cc": 1}
    ];
    const actual = flsgrams(k, vocab, f, lim, start);
    expect(actual).toEqual(expected);
  })
});

describe("canSubtract", () => {
  test("can subtract two frequency objects", () => {
    const freq1 = { a: 2, b: 3 };
    const freq2 = { a: 1, b: 2 };
    expect(canSubtract(freq1, freq2)).toBe(true);
  });

  test("cannot subtract when freq2 has more of a letter than freq1", () => {
    const freq1 = { a: 2, b: 3 };
    const freq2 = { a: 3, b: 2 };
    expect(canSubtract(freq1, freq2)).toBe(false);
  });

  test("can subtract when freq2 has zero counts", () => {
    const freq1 = { a: 2, b: 3 };
    const freq2 = { a: 0, b: 0 };
    expect(canSubtract(freq1, freq2)).toBe(true);
  });
})

describe("nextCombo", () => {
  test("find the first combo", () => {
    const k = "aabbcc";
    const vocab = ["aa", "bb", "cc"];
    const expected = {
      "aa": 1
    };
    const actual = nextCombo(k, vocab, null, 0);
    expect(actual).toEqual(expected);
  });
  test("second combo", () => {
    const k = "aabbaacc";
    const vocab = ["aa", "bb", "cc"];
    const thisCombo = {"aa":1}
    const expected = {
      "aa": 2
    };
    const actual = nextCombo(k, vocab, thisCombo, 0);
    expect(actual).toEqual(expected);
  })
})

describe("compareComboArrays", () => {
  test("...", () => {})
})
