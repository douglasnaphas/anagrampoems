import * as React from "react";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { Typography, Button, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { letters, aContainsB } from "./letters";
import { grams, flgrams } from "./grams";
import { genAnagrams } from "./anagrams";
import TextField from "@mui/material/TextField";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const Editor = ({ keyWord }) => {
  const [commonWords, setCommonWords] = useState([]);
  const [manyWords, setManyWords] = useState([]);
  const [showCommonWords, setShowCommonWords] = useState(true);
  const [showManyWords, setShowManyWords] = useState(true);
  const [lines, setLines] = useState({});
  const [poemLineIdOrder, setPoemLineIdOrder] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedLineWordIndex, setSelectedLineWordIndex] = useState(null);
  const [generatedGrams, setGeneratedGrams] = useState([]);
  const [selectedGramIndex, setSelectedGramIndex] = useState(null);
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
        if (!resp.ok) throw new Error("GET /backend/poem failed");
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
      return; // don't save invalid text on blur
    }

    setPoemError("");
    // clear poem-focused filter when leaving textarea
    setIsPoemFocused(false);
    setActivePoemLineText("");
    if (poemDirty) await savePoemText();
  };

  const handlePoemFocus = () => {
    setIsPoemFocused(true);
    updateActivePoemLine();
  };

  // Keep active line updated for clicks / caret moves
  const handlePoemInteraction = () => {
    if (isPoemFocused) updateActivePoemLine();
  };

  const handleGramClick = (index) => {
    setSelectedGramIndex(index);
  };

  const handleAddGramToPoem = async () => {
    if (selectedGramIndex === null || !generatedGrams[selectedGramIndex])
      return;
    const gramWords = generatedGrams[selectedGramIndex];
    // Compute new lineId
    const newLineId =
      poemLineIdOrder && poemLineIdOrder.length > 0
        ? Math.max(...poemLineIdOrder) + 1
        : 1;
    try {
      // Add line to backend
      const addLineResponse = await fetch(`/backend/poem-lines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyWord, lineId: newLineId }),
      });
      if (!addLineResponse.ok) throw new Error("Failed to add line");
      // Add words to line
      const putWordsResponse = await fetch(`/backend/line-words`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: keyWord,
          lineId: newLineId,
          lineWords: gramWords,
        }),
      });
      if (!putWordsResponse.ok) throw new Error("Failed to add words to line");
      // Update local state
      setLines((prevLines) => ({ ...prevLines, [newLineId]: gramWords }));
      setPoemLineIdOrder((prevOrder) => [...prevOrder, newLineId]);
      setSelectedGramIndex(null);
    } catch (err) {
      console.error("Error adding gram to poem", err);
    }
  };
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

    const fetchLines = async () => {
      try {
        const response = await fetch(
          `/backend/poem-lines?key=${encodeURIComponent(keyWord)}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok, fetching lines");
        }
        const data = await response.json();
        if (data && typeof data === "object") {
          setLines(data);
        } else {
          console.error("Invalid data format for lines:", data);
        }
      } catch (error) {
        console.error("Error fetching lines:", error);
      }
    };

    const fetchPoem = async () => {
      try {
        const response = await fetch(
          `/backend/poem?key=${encodeURIComponent(keyWord)}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok, fetching poem");
        }
        const data = await response.json();
        if (data && typeof data === "object") {
          setPoemLineIdOrder(data.poem_line_id_order);
        } else {
          console.error("Invalid data format for poem:", data);
        }
      } catch (error) {
        console.error("Error fetching poem:", error);
      }
    };

    fetchCommonWords();
    fetchManyWords();
    fetchLines();
    fetchPoem();
  }, [keyWord]);

  // Compute the "display base" used for filtering:
  // - If poem textarea is focused, use the active poem-line text.
  // - Otherwise, if a line in Lines is selected, use its concatenated words.
  const displayBase = (() => {
    if (isPoemFocused && activePoemLineText && activePoemLineText.trim() !== "") {
      return activePoemLineText;
    }
    if (selectedLineId !== null && lines[selectedLineId]) {
      return (lines[selectedLineId] || []).reduce((s, w) => s + w, "");
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

  const filteredGrams = generatedGrams.filter((gramArray) => {
    if (!normalizedBase) return true;
    const gramConcat = (gramArray || []).join("");
    return aContainsB(keyWord, normalizedBase + gramConcat);
  });

  const handleAddLine = async () => {
    // Compute the new lineId
    const newLineId = poemLineIdOrder ? Math.max(...poemLineIdOrder) + 1 : 1;

    try {
      const response = await fetch(`/backend/poem-lines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: keyWord, lineId: newLineId }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok, adding line");
      }

      // Update lines and poemLineIdOrder based on the previous values
      setLines((prevLines) => ({
        ...prevLines,
        [newLineId]: [],
      }));
      setPoemLineIdOrder((prevOrder) => [...prevOrder, newLineId]);
    } catch (error) {
      console.error("Error adding line:", error);
    }
  };

  const handleLineClick = (lineId) => {
    setSelectedLineId(lineId);
  };

  const handleMoveLine = async (direction) => {
    if (selectedLineId === null) return;

    const currentIndex = poemLineIdOrder.indexOf(selectedLineId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= poemLineIdOrder.length) return;

    const newPoemLineIdOrder = [...poemLineIdOrder];
    [newPoemLineIdOrder[currentIndex], newPoemLineIdOrder[newIndex]] = [
      newPoemLineIdOrder[newIndex],
      newPoemLineIdOrder[currentIndex],
    ];

    try {
      const response = await fetch(`/backend/line-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: keyWord,
          poemLineIdOrder: newPoemLineIdOrder,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok, updating line order");
      }

      setPoemLineIdOrder(newPoemLineIdOrder);
    } catch (error) {
      console.error("Error updating line order:", error);
    }
  };

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

  const handleAddWordToLine = async () => {
    if (selectedLineId === null || selectedWord === null) return;

    const newLineWords = [...lines[selectedLineId], selectedWord];

    try {
      const response = await fetch(`/backend/line-words`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: keyWord,
          lineId: selectedLineId,
          lineWords: newLineWords,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok, updating line words");
      }

      // Update lines state with the new word list for the selected line
      setLines((prevLines) => ({
        ...prevLines,
        [selectedLineId]: newLineWords,
      }));
    } catch (error) {
      console.error("Error updating line words:", error);
    }
  };

  const handleDeleteLine = async () => {
    if (selectedLineId === null) return;

    const newPoemLineIdOrder = poemLineIdOrder.filter(
      (lineId) => lineId !== selectedLineId
    );

    try {
      const response = await fetch(
        `/backend/poem-lines?key=${encodeURIComponent(
          keyWord
        )}&lineId=${selectedLineId}&poemLineIdOrder=${encodeURIComponent(
          JSON.stringify(newPoemLineIdOrder)
        )}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok, deleting line");
      }

      // Update lines state to remove the selected line
      setLines((prevLines) => {
        const newLines = { ...prevLines };
        delete newLines[selectedLineId];
        return newLines;
      });

      // Update poemLineIdOrder state to remove the selected line
      setPoemLineIdOrder(newPoemLineIdOrder);

      // Clear the selected line
      setSelectedLineId(null);
    } catch (error) {
      console.error("Error deleting line:", error);
    }
  };

  const handleLineWordClick = (index) => {
    setSelectedLineWordIndex(index);
  };

  const handleRemoveWordFromLine = async () => {
    if (selectedLineId === null || selectedLineWordIndex === null) return;

    const newLineWords = lines[selectedLineId].filter(
      (_, index) => index !== selectedLineWordIndex
    );

    try {
      const response = await fetch(`/backend/line-words`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: keyWord,
          lineId: selectedLineId,
          lineWords: newLineWords,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok, updating line words");
      }

      setLines((prevLines) => ({
        ...prevLines,
        [selectedLineId]: newLineWords,
      }));
      setSelectedLineWordIndex(null);
    } catch (error) {
      console.error("Error updating line words:", error);
    }
  };

  const handleMoveWord = async (direction) => {
    if (selectedLineId === null || selectedLineWordIndex === null) return;

    const currentIndex = selectedLineWordIndex;
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= lines[selectedLineId].length) return;

    const newLineWords = [...lines[selectedLineId]];
    [newLineWords[currentIndex], newLineWords[newIndex]] = [
      newLineWords[newIndex],
      newLineWords[currentIndex],
    ];

    try {
      const response = await fetch(`/backend/line-words`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: keyWord,
          lineId: selectedLineId,
          lineWords: newLineWords,
        }),
      });
      if (!response.ok) {
        throw new Error(
          "Network response was not ok, updating line words on move"
        );
      }

      setLines((prevLines) => ({
        ...prevLines,
        [selectedLineId]: newLineWords,
      }));
      setSelectedLineWordIndex(newIndex);
    } catch (error) {
      console.error("Error updating line words:", error);
    }
  };

  const fullGram = (id) => {
    const lineText = (lines[id] || []).reduce(
      (wholeLine, word) => wholeLine + word,
      ""
    );
    if (aContainsB(keyWord, lineText) && aContainsB(lineText, keyWord)) {
      return true;
    }
    return false;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
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

      <Grid item xs={6} className="grid-item">
        <Typography
          variant="h2"
          component="h2"
          className="center-align"
          id="lines-heading"
        >
          Lines
        </Typography>
        <div>
          <Button onClick={handleAddLine} id="add-line-control">
            Add Line
          </Button>
          <Button id="delete-line-control" onClick={handleDeleteLine}>
            Delete selected line
          </Button>
          <Button
            onClick={handleRemoveWordFromLine}
            disabled={selectedLineWordIndex === null || !lines[selectedLineId]}
          >
            Remove Word
          </Button>
          <Button
            onClick={() => handleMoveWord("left")}
            disabled={
              selectedLineWordIndex === null || selectedLineWordIndex === 0
            }
          >
            Move Left
          </Button>
          <Button
            onClick={() => handleMoveWord("right")}
            disabled={
              selectedLineWordIndex === null ||
              !lines[selectedLineId] ||
              selectedLineWordIndex === lines[selectedLineId].length - 1
            }
          >
            Move Right
          </Button>
        </div>
        <ul className="lines left-align" id="lines">
          {poemLineIdOrder &&
            poemLineIdOrder.map((lineId, index) => (
              <Grid
                container
                item
                xs={12}
                key={lineId}
                id={`line-${lineId}`}
                className={`line-box ${
                  selectedLineId === lineId ? "selected-line" : ""
                }`}
                onClick={() => handleLineClick(lineId)}
              >
                <Grid item xs={11}>
                  {lines[lineId] &&
                    lines[lineId].map((word, index) => (
                      <Box
                        key={index}
                        className={`word-box ${
                          selectedLineId === lineId &&
                          selectedLineWordIndex === index
                            ? "selected-word"
                            : ""
                        }`}
                        onClick={() => handleLineWordClick(index)}
                      >
                        {word}
                      </Box>
                    ))}
                </Grid>
                {selectedLineId === lineId && (
                  <Grid item xs={1} className="line-controls">
                    <ArrowUpwardIcon onClick={() => handleMoveLine("up")} />
                    <ArrowDownwardIcon onClick={() => handleMoveLine("down")} />
                  </Grid>
                )}
                {fullGram(lineId) && (
                  <Grid item xs={1} className="line-controls">
                    <span>✔️</span>
                  </Grid>
                )}
              </Grid>
            ))}
        </ul>
      </Grid>
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
          {selectedLineId && selectedWord && (
            <Button
              id="add-word-to-line-button"
              Add
              commentMore
              actions
              onClick={handleAddWordToLine}
              disabled={
                !aContainsB(
                  keyWord,
                  (lines[selectedLineId] || []).reduce(
                    (wholeLine, word) => wholeLine + word,
                    ""
                  ) + selectedWord
                )
              }
            >
              <ArrowBackIcon />
            </Button>
          )}
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
                    body: JSON.stringify({ key: keyWord, word: selectedWord }),
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
          {selectedLineId !== null &&
            lines[selectedLineId] &&
            lines[selectedLineId].length > 0 && (
              <Button
                onClick={async () => {
                  // Generate grams (anagrams) when a word is selected.
                  const vocabUnion = Array.from(
                    new Set([...commonWords, ...manyWords])
                  ).filter((w) => !excludedWords.includes(w));
                  const mustInclude = lines[selectedLineId];
                  const anagrams = [];
                  for await (const phrase of genAnagrams({
                    key: keyWord,
                    vocab: vocabUnion,
                    mustInclude,
                  })) {
                    anagrams.push(phrase);
                  }
                  setGeneratedGrams(anagrams);
                }}
              >
                Generate grams
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
                  className={`pill ${selectedWord === word ? "selected-word" : ""}`}
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
                  className={`pill ${selectedWord === word ? "selected-word" : ""}`}
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
            <ul className="dictionary left-align" id="excluded-words-section">
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
          <Typography
            variant="h3"
            component="h3"
            className="center-align"
            id="grams-heading"
          >
            Grams
          </Typography>
          <ul className="dictionary left-align" id="grams-section">
            {filteredGrams.length > 0
              ? filteredGrams.map((gramArray, index) => (
                  <li
                    key={index}
                    className={`pill${selectedGramIndex === index ? " selected-word" : ""}`}
                    onClick={() => handleGramClick(index)}
                  >
                    {gramArray.join(" ")}
                  </li>
                ))
              : "No grams generated"}
          </ul>
          {selectedGramIndex !== null && (
            <Button onClick={handleAddGramToPoem} id="add-gram-to-poem-button">
              Add selected gram as new line
            </Button>
          )}
        </div>
      </Grid>
    </Grid>
  );
};

export default Editor;
