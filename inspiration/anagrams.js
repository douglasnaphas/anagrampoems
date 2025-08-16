// ChatGPT 5 response to:
// Using all these optimization techniques, can you write an implementation
// of an anagram generator, that will generate all anagrams of a person's name
// (the key), that is efficient enough to run in the browser?

// anagrams.js

/** Normalize text: keep only a-z, lowercase. */
export function normalize(s) {
  return (s || "").toLowerCase().replace(/[^a-z]/g, "");
}

/** Build {char: count} frequency map for a string. */
export function freqOf(s) {
  const f = Object.create(null);
  for (const ch of s) f[ch] = (f[ch] || 0) + 1;
  return f;
}

/** Can we subtract wf from F (i.e., F has at least those letters)? */
export function canSubtract(F, wf) {
  for (const ch in wf) {
    if ((F[ch] || 0) < wf[ch]) return false;
  }
  return true;
}

/** Return F - wf (non-mutating). Deletes zero entries. */
export function subtractFreq(F, wf) {
  const g = { ...F };
  for (const ch in wf) {
    const v = (g[ch] || 0) - wf[ch];
    if (v <= 0) delete g[ch];
    else g[ch] = v;
  }
  return g;
}

/** Is a frequency map empty? */
export function isEmpty(F) {
  // Faster than Object.keys(F).length for small maps
  // eslint-disable-next-line no-unused-vars
  for (const _ in F) return false;
  return true;
}

/** Stable string signature for memo/caching (e.g., a2b1c3). */
function sig(F) {
  let out = "";
  for (const ch of Object.keys(F).sort()) out += ch + F[ch];
  return out;
}

/**
 * Preprocess the vocabulary for a specific key:
 *  - normalize words
 *  - drop words that can't fit the key's letters
 *  - precompute word frequencies
 *  - sort by (len asc, then lex asc) for predictable traversal
 */
export function prepVocabForKey(keyFreq, vocabRaw) {
  const words = [];
  for (const w0 of vocabRaw) {
    const w = normalize(w0);
    if (!w) continue;
    const wf = freqOf(w);
    if (canSubtract(keyFreq, wf)) {
      words.push({ w, wf, len: w.length });
    }
  }
  words.sort((a, b) => a.len - b.len || (a.w < b.w ? -1 : a.w > b.w ? 1 : 0));
  return words;
}

/**
 * Async generator that yields *complete* anagram combos (arrays of words).
 *
 * Options:
 *   - mustInclude: array of required words (exact matches in vocab)
 *   - yieldEvery: yield to event loop after this many DFS steps (default 4k)
 *
 * Traversal produces *combinations with repetition* in non-decreasing vocab index
 * (so word-order in a phrase doesn’t matter, eliminating duplicates).
 *
 * Usage:
 *   for await (const phrase of genAnagrams({ key, vocab, mustInclude:['wit'] })) {
 *     console.log(phrase.join(" "));
 *   }
 */
export async function* genAnagrams({
  key,
  vocab,
  mustInclude = [],
  yieldEvery = 4096,
} = {}) {
  const k = normalize(key);
  if (!k) return;

  // Step 1: apply filter words up-front
  let K = k;
  for (const req of mustInclude) {
    const rw = normalize(req);
    if (!rw) continue;
    K = kMinusWord(K, rw); // removes letters in-order; faster than multi-map ops
    if (K == null) return; // required word doesn't fit -> no anagrams
  }

  const keyFreq = freqOf(K);

  // Step 2: prep filtered vocab suited to this reduced key
  const dict = prepVocabForKey(keyFreq, vocab); // [{w,wf,len}, ...]
  if (dict.length === 0) return;

  // Map required words to their exact, normalized forms as they must appear
  const reqWords = mustInclude.map((w) => normalize(w)).filter(Boolean);

  // Step 3: backtracking with pruning, non-blocking
  //   We enumerate combinations by index (allowing reuse: i stays same on recursion)
  let steps = 0;
  const noSolution = new Set(); // memo: states that lead to 0 solutions
  const reqPrefix = reqWords.slice(); // to append on success

  async function dfs(startIdx, remFreq, path) {
    // Periodically yield to event loop to keep UI responsive
    if (++steps % yieldEvery === 0) {
      // microtask hop is enough in modern browsers
      await Promise.resolve();
    }
  }
}
// - We **yield control** to the browser every few thousand steps using `await Promise.resolve()` so the **event loop** can process input/paint—keeping the UI responsive while still being single-threaded. (This is the microtask hop pattern used with async/await.) :contentReference[oaicite:4]{index=4}
// - Vocabulary is **pre-filtered** specifically for the current key (any word that can’t fit the reduced letter budget is removed), and we iterate in **length-ascending** order so once a word is too long for the remaining letters, we can **break** early for the rest of the list.

// > Note: If you later want even more speed, you can swap the list of prefiltered words for a **trie** (prefix tree) and build words character-by-character from the remaining letters—this prunes entire subtrees as soon as a letter isn’t available. It’s a well-known optimization for dictionary-constrained anagrams. :contentReference[oaicite:5]{index=5}

// ---

// ### Minimal usage example

// ```js
// import { genAnagrams } from "./anagrams.js";

// const key = "Sarah Whitt"; // any capitals/spaces/punctuation ok
// const vocab = ["a","aa","hat","wit","has","hart","shirt","wash","this","rah","tar","hart","whit"];
// const mustInclude = ["wit"]; // exact word(s) to force into every result

// (async () => {
//   let shown = 0;
//   for await (const phrase of genAnagrams({ key, vocab, mustInclude, yieldEvery: 2000 })) {
//     console.log(phrase.join(" "));
//     if (++shown >= 50) break; // stop after 50 for demo
//   }
// })();
