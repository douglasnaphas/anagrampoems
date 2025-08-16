import { describe, test, expect } from "vitest";
import {
  normalize,
  freqOf,
  canSubtract,
  subtractFreq,
  isEmpty,
  kMinusWord,
  prepVocabForKey,
  genAnagrams,
} from "./anagrams.js";

// Helper to normalize an array of arrays into a Set of sorted JSON strings for comparison
function normalizeList(listOfLists) {
  return new Set(listOfLists.map((sub) => JSON.stringify([...sub].sort())));
}

describe("normalize", () => {
  test("removes non-alpha and lowercases", () => {
    expect(normalize("Sarah Whitt!")).toBe("sarahwhitt");
    expect(normalize("A-B_C")).toBe("abc");
    expect(normalize("")).toBe("");
    expect(normalize(null)).toBe("");
  });
});

describe("freqOf", () => {
  test("counts letters", () => {
    expect(freqOf("aabbc")).toEqual({ a: 2, b: 2, c: 1 });
    expect(freqOf("")).toEqual({});
  });
});

describe("canSubtract", () => {
  test("true if F has at least wf's letters", () => {
    expect(canSubtract({ a: 2, b: 1 }, { a: 1 })).toBe(true);
    expect(canSubtract({ a: 2, b: 1 }, { a: 3 })).toBe(false);
    expect(canSubtract({ a: 2, b: 1 }, { c: 1 })).toBe(false);
  });
});

describe("subtractFreq", () => {
  test("subtracts and deletes zero entries", () => {
    expect(subtractFreq({ a: 2, b: 1 }, { a: 1 })).toEqual({ a: 1, b: 1 });
    expect(subtractFreq({ a: 2, b: 1 }, { a: 2 })).toEqual({ b: 1 });
    expect(subtractFreq({ a: 2, b: 1 }, { a: 2, b: 1 })).toEqual({});
  });
});

describe("isEmpty", () => {
  test("true for empty freq map", () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe("kMinusWord", () => {
  test("removes word's letters from key", () => {
    expect(kMinusWord("kate", "at")).toBe("ek");
    expect(kMinusWord("kate", "k")).toBe("aet");
    expect(kMinusWord("kate", "take")).toBe("");
    expect(kMinusWord("kate", "z")).toBe(null);
  });
});

describe("prepVocabForKey", () => {
  test("filters and sorts vocab", () => {
    const keyFreq = freqOf("kate");
    const vocabRaw = ["a", "k", "t", "e", "at", "eat", "take", "zebra"];
    const result = prepVocabForKey(keyFreq, vocabRaw);
    const words = result.map((w) => w.w);
    expect(words).toEqual(["a", "e", "k", "t", "at", "eat", "take"]);
  });
});

describe("genAnagrams", () => {
  test("generates all anagrams for 'kate'", async () => {
    const key = "kate";
    const vocab = ["a", "k", "t", "e", "at", "eat", "take"];
    const expected = [
      ["take"],
      ["eat", "k"],
      ["at", "k", "e"],
      ["k", "a", "t", "e"],
    ];
    const result = [];
    for await (const phrase of genAnagrams({ key, vocab })) {
      result.push(phrase);
    }
    expect(normalizeList(result)).toEqual(normalizeList(expected));
  });

  test("mustInclude filter works", async () => {
    const key = "kate";
    const vocab = ["a", "k", "t", "e", "at", "eat", "take"];
    const mustInclude = ["eat"];
    const expected = [["eat", "k"]];
    const result = [];
    for await (const phrase of genAnagrams({ key, vocab, mustInclude })) {
      result.push(phrase);
    }
    expect(normalizeList(result)).toEqual(normalizeList(expected));
  });

  test("returns empty if mustInclude can't fit", async () => {
    const key = "kate";
    const vocab = ["a", "k", "t", "e", "at", "eat", "take"];
    const mustInclude = ["zebra"];
    const result = [];
    for await (const phrase of genAnagrams({ key, vocab, mustInclude })) {
      result.push(phrase);
    }
    expect(result).toEqual([]);
  });
});
