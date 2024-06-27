const wordSet = require("./wordSet");
const equalSets = (set1, set2) => {
  const a1 = Array.from(set1);
  const a2 = Array.from(set2);
  for (i in a1) {
    const e = a1[i];
    if (!set2.has(e)) {
      return false;
    }
  }
  for (i in a2) {
    const e = a2[i];
    if (!set1.has(e)) {
      return false;
    }
  }
  return true;
};
const wordMapWithJustA = {
  a: [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ],
};
test("just a", () => {
  expect(equalSets(wordSet("a", wordMapWithJustA), new Set("a"))).toBe(true);
});
test("expect four words", () => {
  const wordMap = {
    a: [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0,
    ],
    big: [
      0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0,
    ],
    care: [
      1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
      0,
    ],
    era: [
      1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
      0,
    ],
    gig: [
      0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0,
    ],
    race: [
      1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
      0,
    ],
  };
  expect(
    equalSets(
      wordSet("race", wordMap),
      new Set("a").add("care").add("era").add("race")
    )
  ).toBe(true);
});
