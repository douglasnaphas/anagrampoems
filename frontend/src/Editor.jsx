import * as React from "react";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { Typography, Button, Box } from "@mui/material";

const Editor = ({ keyWord }) => {
  const [commonWords, setCommonWords] = useState([]);
  const [manyWords, setManyWords] = useState([]);
  const [showCommonWords, setShowCommonWords] = useState(true);
  const [showManyWords, setShowManyWords] = useState(true);
  const [lines, setLines] = useState({});
  const [poemLineIdOrder, setPoemLineIdOrder] = useState([]);

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
    const newLineId = poemLineIdOrder
      ? Math.max(...poemLineIdOrder) + 1
      : 1;

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
        <div className="line-controls">
          <Button onClick={handleAddLine}>Add Line</Button>
        </div>
        <ul className="lines left-align" id="lines">
          {poemLineIdOrder &&
            poemLineIdOrder.map((lineId) => (
              <Grid item xs={6} key={lineId} className="line-box">
                {lines[lineId] &&
                  lines[lineId].map((word, index) => (
                    <Box key={index} className="word-box">
                      {word}
                    </Box>
                  ))}
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
                .sort((a, b) => b.length - a.length || a.localeCompare(b))
                .map((word, index) => (
                  <li key={`${index}-${word}`} className="pill">
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
                .sort((a, b) => b.length - a.length || a.localeCompare(b))
                .map((word, index) => (
                  <li key={`${index}-${word}`} className="pill">
                    {word}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </Grid>
    </Grid>
  );
};

export default Editor;
