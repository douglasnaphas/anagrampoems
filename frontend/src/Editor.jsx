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

  const handleExcludeWord = () => {
    if (selectedWord && !excludedWords.includes(selectedWord)) {
      setExcludedWords((prev) => [...prev, selectedWord]);
      setSelectedWord(null);
    }
  };

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
          {selectedWord && (
            <Button
              onClick={handleExcludeWord}
              id="exclude-word-button"
            >
              Exclude Word
            </Button>
          )}
          {selectedWord && (
            <Button
              onClick={async () => {
                // Generate grams (anagrams) when a word is selected.
                const vocabUnion = Array.from(new Set([...commonWords, ...manyWords])).filter(
                  (w) => !excludedWords.includes(w)
                );
                const anagrams = [];
                for await (const phrase of genAnagrams({
                  key: keyWord,
                  vocab: vocabUnion,
                  mustInclude: [selectedWord],
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
              {commonWords
                .filter((word) =>
                  !excludedWords.includes(word) &&
                  (selectedLineId
                    ? aContainsB(
                        keyWord,
                        (lines[selectedLineId] || []).reduce(
                          (wholeLine, w) => wholeLine + w,
                          ""
                        ) + word
                      )
                    : true)
                )
                .sort((a, b) => b.length - a.length || a.localeCompare(b))
                .map((word, index) => (
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
              {manyWords
                .filter((word) =>
                  !excludedWords.includes(word) &&
                  (selectedLineId
                    ? aContainsB(
                        keyWord,
                        (lines[selectedLineId] || []).reduce(
                          (wholeLine, w) => wholeLine + w,
                          ""
                        ) + word
                      )
                    : true)
                )
                .sort((a, b) => b.length - a.length || a.localeCompare(b))
                .map((word, index) => (
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
                    <li key={`${index}-excluded-${word}`} className="pill">
                      {word}
                    </li>
                  ))
                : "No excluded words"}
            </ul>
          )}
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
            {generatedGrams.length > 0
              ? generatedGrams.map((gramArray, index) => (
                  <li key={index} className="pill">
                    {gramArray.join(" ")}
                  </li>
                ))
              : "No grams generated"}
          </ul>
        </div>
      </Grid>
    </Grid>
  );
};

export default Editor;
