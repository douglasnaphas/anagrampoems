import { letters, aContainsB } from "./letters";

test("letters function should return correct array for 'abc'", () => {
  expect(letters("abc")).toEqual([
    1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ]);
});

test("letters function should return correct array for 'add'", () => {
  expect(letters("add")).toEqual([
    1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ]);
});

test("letters function should return correct array for 'Hello'", () => {
  expect(letters("Hello")).toEqual([
    0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ]);
});

test("letters function should return correct array for an empty string", () => {
  expect(letters("")).toEqual([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ]);
});

test("letters function should return correct array for 'AaBbCc'", () => {
  expect(letters("AaBbCc")).toEqual([
    2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ]);
});

test("aContainsB function should return true for 'abc' and 'a'", () => {
  expect(aContainsB("abc", "a")).toBe(true);
});

test("aContainsB function should return true for 'abc' and 'abc'", () => {
  expect(aContainsB("abc", "abc")).toBe(true);
});

test("aContainsB function should return false for 'abc' and 'abcd'", () => {
  expect(aContainsB("abc", "abcd")).toBe(false);
});

test("aContainsB function should return true for 'aabbcc' and 'abc'", () => {
  expect(aContainsB("aabbcc", "abc")).toBe(true);
});

test("aContainsB function should return false for 'aabbcc' and 'abcd'", () => {
  expect(aContainsB("aabbcc", "abcd")).toBe(false);
});

test("aContainsB function should return true for 'Douglas Naphas' and 'uganda'", () => {
  expect(aContainsB("Douglas Naphas", "uganda")).toBe(true);
});

test("aContainsB function should return false for 'Douglas Naphas' and 'uuganda'", () => {
  expect(aContainsB("Douglas Naphas", "uuganda")).toBe(false);
});