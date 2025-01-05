const request = require("supertest");
const express = require("express");
const { getGrams, findAnagrams, grams } = require("./getGrams"); // Import getGrams and findAnagrams
const { letters, letterCount, countAContainsCountB } = require("./letters");

const app = express();
app.get("/getGrams", getGrams);

describe("GET /getGrams", () => {
  it("should return 400 if letterCount is missing", async () => {
    const response = await request(app).get("/getGrams");
    expect(response.status).toBe(400);
    expect(response.text).toBe("Invalid letter count format");
  });

  it("should return 400 if letterCount is not an array", async () => {
    const response = await request(app)
      .get("/getGrams")
      .query({ letterCount: "not-an-array" });
    expect(response.status).toBe(400);
    expect(response.text).toBe("Invalid letter count format");
  });

  it("should return 400 if letterCount length is not 26", async () => {
    const response = await request(app)
      .get("/getGrams")
      .query({ letterCount: new Array(25).fill(0) });
    expect(response.status).toBe(400);
    expect(response.text).toBe("Invalid letter count format");
  });

  it("should return anagrams for valid letterCount", async () => {
    const letterCount = new Array(26).fill(0);
    letterCount[0] = 2; // 'a'
    letterCount[1] = 1; // 'b'
    const response = await request(app).get("/getGrams").query({ letterCount });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.any(Array));
  });

  test("the response for 'kate' should include 'take'", async () => {
    const letterCount = [
      1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
      0,
    ];
  });

  test("countAContainsCountB correctly identifies if one letter count array contains another", () => {
    const a = letters("hello");
    const b = letters("he");
    expect(countAContainsCountB(a, b)).toBe(true);
  });
});

describe("findAnagrams", () => {
  it("should find anagrams for a given letter count", () => {
    const words = ["ab", "ba", "abc", "cab"];
    const letterCount = new Array(26).fill(0);
    letterCount[0] = 2; // 'a'
    letterCount[1] = 1; // 'b'
    const anagrams = findAnagrams(words, letterCount);
    expect(anagrams).toEqual([["ab"], ["ba"]]);
  });

  it("should return an empty array if no anagrams are found", () => {
    const words = ["abc", "def"];
    const letterCount = new Array(26).fill(0);
    letterCount[0] = 1; // 'a'
    letterCount[1] = 1; // 'b'
    letterCount[2] = 1; // 'c'
    const anagrams = findAnagrams(words, letterCount);
    expect(anagrams).toEqual([]);
  });
});

test("how array tests work", () => {
  const a = [1, 2, 3];
  const b = [1, 2, 3];
  expect(a).toEqual(b);
  expect(a).not.toBe(b);
  const innerArray = ["some", "words"];
  const outerArray = [
    ["word", "set", "one"],
    ["word", "set", "two"],
    ["some", "words"],
  ];
  expect(outerArray).toContainEqual(innerArray);
});

describe.only("grams", () => {
  it.skip("should return an empty array if no words are provided", () => {
    const letterCount = new Array(26).fill(0);
    const results = grams({}, letterCount);
    expect(results).toEqual([]);
  });

  test.skip("a word in vocab cannot be formed from key", () => {
    const vocab = { bat: letters("bat") };
    const keyLetterCount = letters("cat");
    expect(() => grams(vocab, keyLetterCount)).toThrow(
      "a word in vocab cannot be formed from key"
    );
  });

  test("it should return full grams of 'kate'", () => {
    const vocab = {
      take: letters("take"),
      kate: letters("kate"),
      tea: letters("tea"),
      eat: letters("eat"),
      at: letters("at"),
      a: letters("a"),
      k: letters("k"),
    };
    const keyLetterCount = letters("kate");
    const results = grams(vocab, keyLetterCount);
    // expect results to contain ["k", "tea"]
    expect(results).toContainEqual(["k", "tea"]);
    expect(results).toContainEqual(["k", "eat"]);
  });
});
