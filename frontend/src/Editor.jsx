import * as React from "react";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { Typography, Button } from "@mui/material";
import { aContainsB } from "./letters";
import TextField from "@mui/material/TextField";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const Editor = ({ keyWord }) => {
  const [commonWords, setCommonWords] = useState([]);
  const [manyWords, setManyWords] = useState([]);
  const [showCommonWords, setShowCommonWords] = useState(true);
  const [showManyWords, setShowManyWords] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  // --- Poem section state & helpers ---
  // Poem text + persistence state
  const [poemText, setPoemText] = useState("");
  const [poemError, setPoemError] = useState("");
  const [poemDirty, setPoemDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false); // flips true briefly after a
  // successful save
  const poemRef = React.useRef(null);

  // Poem-focused display filter state:
  const [isPoemFocused, setIsPoemFocused] = useState(false);
  const [activePoemLineText, setActivePoemLineText] = useState("");

  // Helper to update the active poem-line based on caret position
  const updateActivePoemLine = () => {
    const cursorPos = poemRef.current?.selectionStart ?? poemText.length;
    const { lineText } = getActiveLineInfo(poemText, cursorPos);
    setActivePoemLineText(lineText || "");
  };

  useEffect(() => {
    let cancelled = false;

    const loadPoem = async () => {
      try {
        const resp = await fetch(
          `/backend/poem-text?key=${encodeURIComponent(keyWord)}`
        );
        if (!resp.ok) throw new Error("GET /backend/poem-text failed");
        const poem = await resp.json();
        if (!cancelled) {
          const initial = typeof poem?.text === "string" ? poem.text : "";
          setPoemText(initial);
          setPoemDirty(false);
          setSaveOk(false);
          setPoemError(""); // reset any prior error
        }
      } catch (e) {
        console.error("Failed to load poem text:", e);
        if (!cancelled) {
          setPoemText("");
          setPoemDirty(false);
        }
      }
    };

    loadPoem();
    return () => {
      cancelled = true;
    };
  }, [keyWord]);

  // Count letters a-z only, case-insensitive
  const countLetters = (s = "") => {
    const out = Object.create(null);
    for (const ch of s.toLowerCase()) {
      if (ch >= "a" && ch <= "z") out[ch] = (out[ch] || 0) + 1;
    }
    return out;
  };

  const countsLessOrEqual = (a, b) => {
    for (const k in a) if ((a[k] || 0) > (b[k] || 0)) return false;
    return true;
  };
  const countsEqual = (a, b) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) if ((a[k] || 0) !== (b[k] || 0)) return false;
    return true;
  };

  // Precompute the letter budget of the keyWord from props
  const poemKeyCounts = React.useMemo(() => countLetters(keyWord), [keyWord]);

  // Get active line given full textarea value and caret position
  const getActiveLineInfo = (value, cursorPos) => {
    const before = value.slice(0, cursorPos ?? 0);
    const lineStart = before.lastIndexOf("\n") + 1;
    let lineEnd = value.indexOf("\n", cursorPos ?? 0);
    if (lineEnd === -1) lineEnd = value.length;
    const lineText = value.slice(lineStart, lineEnd);
    return { lineText, lineStart, lineEnd };
  };

  // While typing: allow only if active line's letters stay within the key's budget
  const handlePoemTextChange = (e) => {
    const next = e.target.value;
    const cursorPos = poemRef.current?.selectionStart ?? next.length;
    const { lineText } = getActiveLineInfo(next, cursorPos);
    const used = countLetters(lineText);
    if (countsLessOrEqual(used, poemKeyCounts)) {
      setPoemText(next);
      setPoemError("");
      setPoemDirty(true);
      setSaveOk(false);
      if (isPoemFocused) {
        // keep the active-poem-line in sync while typing
        setActivePoemLineText(lineText || "");
      }
    } else {
      // Reject the change (do not update state)
      setPoemError("This line would exceed letters available in the poem key.");
    }
  };

  const savePoemText = async () => {
    setSaving(true);
    setSaveOk(false);
    try {
      const resp = await fetch("/backend/poem-text", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // credentials: "include", // add if your other calls use it
        body: JSON.stringify({ key: keyWord, text: poemText }),
      });
      if (!resp.ok) throw new Error("PUT /backend/poem-text failed");
      setPoemDirty(false);
      setSaveOk(true);
    } catch (e) {
      console.error("Failed to save poem text:", e);
      // Keep dirty=true so the user still sees "changes unsaved"
    } finally {
      setSaving(false);
    }
  };

  // On blur: if the active line is non-empty, require it to be a full anagram of the key
  const handlePoemBlur = async () => {
    const cursorPos = poemRef.current?.selectionStart ?? poemText.length;
    const { lineText } = getActiveLineInfo(poemText, cursorPos);
    const used = countLetters(lineText);

    if (lineText.trim().length > 0 && !countsEqual(used, poemKeyCounts)) {
      setPoemError("Active line is not a full anagram of the poem key.");
    } else {
      setPoemError("");
    }

    // clear poem-focused filter when leaving textarea
    setIsPoemFocused(false);
    setActivePoemLineText("");
    if (poemDirty) await savePoemText();
  };

  const handlePoemFocus = () => {
    setIsPoemFocused(true);
    updateActivePoemLine();
  };

  // Update active line when caret moves without text change
  const handlePoemSelect = () => {
    if (isPoemFocused) updateActivePoemLine();
  };
  const handlePoemClick = () => {
    if (isPoemFocused) updateActivePoemLine();
  };
  const handlePoemKeyUp = () => {
    if (isPoemFocused) updateActivePoemLine();
  };

  // save the text periodically even if the textarea remains in focus
  useEffect(() => {
    if (!poemDirty) return;
    const t = setTimeout(() => {
      savePoemText();
    }, 1000); // 1s after last keystroke
    return () => clearTimeout(t);
  }, [poemText, poemDirty]);

  // Render like: "aaa d g h l n o p ss u"
  const formatRemainingLetters = (remainingCounts) => {
    const groups = [];
    for (let i = 0; i < 26; i++) {
      const ch = String.fromCharCode("a".charCodeAt(0) + i);
      const n = remainingCounts[ch] || 0;
      if (n > 0) groups.push(ch.repeat(n));
    }
    return groups.join(" ");
  };

  // Remaining letters for the current line (blank line => full budget)
  const remainingLettersString = React.useMemo(() => {
    const line = isPoemFocused ? activePoemLineText || "" : "";
    const used = countLetters(line);
    const remaining = Object.create(null);
    for (const k in poemKeyCounts) {
      const rem = (poemKeyCounts[k] || 0) - (used[k] || 0);
      if (rem > 0) remaining[k] = rem;
    }
    return formatRemainingLetters(remaining);
  }, [isPoemFocused, activePoemLineText, poemKeyCounts]);

  const [excludedWords, setExcludedWords] = useState([]);
  const [showExcludedWords, setShowExcludedWords] = useState(true);

  useEffect(() => {
    const fetchCommonWords = async () => {
      try {
        const response = await fetch(
          `/backend/common-words?key=${encodeURIComponent(keyWord)}`,
          {
            cache: "default", // Use the default cache behavior
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setCommonWords(data);
        } else {
          console.error("Invalid data format for common words:", data);
        }
      } catch (error) {
        console.error("Error fetching common words:", error);
      }
    };

    const fetchManyWords = async () => {
      try {
        const response = await fetch(
          `/backend/many-words?key=${encodeURIComponent(keyWord)}`,
          { cache: "default" }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setManyWords(data);
        } else {
          console.error("Invalid data format for many words:", data);
        }
      } catch (error) {
        console.error("Error fetching many words:", error);
      }
    };

    fetchCommonWords();
    fetchManyWords();
  }, [keyWord]);

  // Compute the "display base" used for filtering:
  // - If poem textarea is focused, use the active poem-line text.
  // - Otherwise, if a line in Lines is selected, use its concatenated words.
  const displayBase = (() => {
    if (
      isPoemFocused &&
      activePoemLineText &&
      activePoemLineText.trim() !== ""
    ) {
      return activePoemLineText;
    }
    return null;
  })();
  const normalizedBase = displayBase
    ? String(displayBase).replace(/[^a-zA-Z]/g, "")
    : null;

  // Filtered lists to render
  const filteredCommonWords = commonWords
    .filter(
      (word) =>
        !excludedWords.includes(word) &&
        (normalizedBase ? aContainsB(keyWord, normalizedBase + word) : true)
    )
    .sort((a, b) => b.length - a.length || a.localeCompare(b));

  const filteredManyWords = manyWords
    .filter(
      (word) =>
        !excludedWords.includes(word) &&
        (normalizedBase ? aContainsB(keyWord, normalizedBase + word) : true)
    )
    .sort((a, b) => b.length - a.length || a.localeCompare(b));

  const handleWordClick = (word) => {
    setSelectedWord(word);
  };

  const handleExcludeWord = async () => {
    if (selectedWord && !excludedWords.includes(selectedWord)) {
      const newExcludedWords = [...excludedWords, selectedWord];
      setExcludedWords(newExcludedWords);
      setSelectedWord(null);
      // Persist excluded words to backend
      try {
        await fetch("/backend/excluded-words", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: keyWord,
            excludedWords: newExcludedWords,
          }),
        });
      } catch (err) {
        console.error("Error persisting excluded words", err);
      }
    }
  };
  // Optionally, fetch excludedWords from backend on mount
  useEffect(() => {
    const fetchExcludedWords = async () => {
      try {
        const response = await fetch(
          `/backend/excluded-words?key=${encodeURIComponent(keyWord)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.excludedWords)) {
            setExcludedWords(data.excludedWords);
          }
        }
      } catch (err) {
        console.error("Error fetching excluded words", err);
      }
    };
    fetchExcludedWords();
  }, [keyWord]);

  return (
    <Grid container spacing={2}>
      {/* Letters section */}
      <Grid item xs={12}>
        <Typography
          variant="h2"
          component="h2"
          className="center-align"
          id="letters-heading"
        >
          Letters
        </Typography>
        <Typography
          variant="h5"
          component="div"
          className="center-align"
          id="letters-remaining"
          sx={{ fontFamily: "monospace", marginTop: 8 }}
          aria-live="polite"
        >
          {remainingLettersString || "\u00A0"}
        </Typography>
      </Grid>

      {/* TWO-COLUMN ROW */}
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="flex-start">
          {/* LEFT: POEM */}
          <Grid item xs={6}>
            <Typography
              variant="h2"
              component="h2"
              className="center-align"
              id="poem-heading"
            >
              Poem
            </Typography>

            <TextField
              id="poem-textarea"
              label={`Type an anagram line for “${keyWord}”`}
              placeholder="Type your poem here…"
              multiline
              minRows={4}
              fullWidth
              value={poemText}
              onChange={handlePoemTextChange}
              onBlur={handlePoemBlur}
              onFocus={handlePoemFocus}
              onSelect={handlePoemSelect}
              onClick={handlePoemClick}
              onKeyUp={handlePoemKeyUp}
              inputRef={poemRef}
              error={Boolean(poemError)}
              helperText={
                poemError ||
                "Letters must fit the key (case-insensitive). Punctuation and spaces are allowed. Rule applies to the active line."
              }
            />

            {/* Subtle save indicator */}
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 0.5, opacity: 0.8 }}
            >
              {saving
                ? "saving…"
                : poemDirty
                ? "changes unsaved"
                : saveOk
                ? "✓ changes saved"
                : " "}
            </Typography>
          </Grid>

          {/* Page-wide lock while saving */}
          <Backdrop
            open={saving}
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
          >
            <CircularProgress />
          </Backdrop>

          {/* RIGHT: DICTIONARY */}
          <Grid item xs={6} className="grid-item">
            <Typography
              variant="h2"
              component="h2"
              className="center-align"
              id="dictionary-heading"
            >
              Dictionary
            </Typography>
            <div id="controls">
              <Button onClick={() => setShowCommonWords(!showCommonWords)}>
                {showCommonWords ? "Hide" : "Show"} Common words
              </Button>
              <Button onClick={() => setShowManyWords(!showManyWords)}>
                {showManyWords ? "Hide" : "Show"} Many words
              </Button>
              <Button onClick={() => setShowExcludedWords(!showExcludedWords)}>
                {showExcludedWords ? "Hide" : "Show"} Excluded words
              </Button>
              {selectedWord && !excludedWords.includes(selectedWord) && (
                <Button onClick={handleExcludeWord} id="exclude-word-button">
                  Exclude Word
                </Button>
              )}
              {selectedWord && excludedWords.includes(selectedWord) && (
                <Button
                  onClick={async () => {
                    // Un-exclude word logic
                    try {
                      await fetch("/backend/excluded-word", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          key: keyWord,
                          word: selectedWord,
                        }),
                      });
                      setExcludedWords(
                        excludedWords.filter((w) => w !== selectedWord)
                      );
                      setSelectedWord(null);
                    } catch (err) {
                      console.error("Error un-excluding word", err);
                    }
                  }}
                  id="unexclude-word-button"
                >
                  Un-exclude Word
                </Button>
              )}
            </div>
            <div className="scrollable-dictionary">
              <Typography
                variant="h3"
                component="h3"
                className="center-align"
                id="common-words-heading"
              >
                Common words
              </Typography>
              {showCommonWords && (
                <ul className="dictionary left-align">
                  {filteredCommonWords.map((word, index) => (
                    <li
                      key={`${index}-${word}`}
                      id={`common-word-${word}`}
                      className={`pill ${
                        selectedWord === word ? "selected-word" : ""
                      }`}
                      onClick={() => handleWordClick(word)}
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              )}
              <Typography
                variant="h3"
                component="h3"
                className="center-align"
                id="many-words-heading"
              >
                Many words
              </Typography>
              {showManyWords && (
                <ul className="dictionary left-align">
                  {filteredManyWords.map((word, index) => (
                    <li
                      key={`${index}-${word}`}
                      id={`many-word-${word}`}
                      className={`pill ${
                        selectedWord === word ? "selected-word" : ""
                      }`}
                      onClick={() => handleWordClick(word)}
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              )}
              <Typography
                variant="h3"
                component="h3"
                className="center-align"
                id="excluded-words-heading"
              >
                Excluded words
              </Typography>
              {showExcludedWords && (
                <ul
                  className="dictionary left-align"
                  id="excluded-words-section"
                >
                  {excludedWords.length > 0
                    ? excludedWords.map((word, index) => (
                        <li
                          key={`${index}-excluded-${word}`}
                          className={`pill ${
                            selectedWord === word ? "selected-word" : ""
                          }`}
                          onClick={() => handleWordClick(word)}
                        >
                          {word}
                        </li>
                      ))
                    : "No excluded words"}
                </ul>
              )}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Editor;
