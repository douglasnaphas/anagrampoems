import { grams } from './grams';

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

test('grams function with w = "kate"', () => {
    const w = "kate";
    const vocab = ["a", "k", "t", "e", "at", "eat", "take"];
    const expected = new Set();
    expected.add(["take"]);
    expected.add(["eat", "k"]);
    expected.add(["at", "k", "e"]);
    expected.add(["k", "a", "t", "e"]);

    const result = grams(w, vocab);
    expect(setEquals(result, expected)).toBe(true);
});