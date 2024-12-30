import * as React from "react";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";

const Editor = ({ keyWord }) => {
  const [commonWords, setCommonWords] = useState([]);
  const [manyWords, setManyWords] = useState([]);

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
        setCommonWords(data);
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
        setManyWords(data);
      } catch (error) {
        console.error("Error fetching many words:", error);
      }
    };
    fetchCommonWords();
    fetchManyWords();
  }, [keyWord]);

  return (
    <>
      <Grid item xs={6} className="grid-item">
        <Typography
          variant="h2"
          component="h2"
          className="center-align"
          id="lines-heading"
        >
          Lines
        </Typography>
        <ul className="lines left-align">
          <li key="keyWord" className="pill">
            {keyWord}
          </li>
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
        <Typography
          variant="h3"
          component="h3"
          className="center-align"
          id="common-words-heading"
        >
          Common words
        </Typography>
        <ul className="dictionary left-align">
          {commonWords
            .sort((a, b) => b.length - a.length || a.localeCompare(b))
            .map((word, index) => (
              <li key={`${index}-${word}`} className="pill">
                {word}
              </li>
            ))}
        </ul>
        <Typography
          variant="h3"
          component="h3"
          className="center-align"
          id="many-words-heading"
        >
          Many words
        </Typography>
        <ul className="dictionary left-align">
          {manyWords
            .sort((a, b) => b.length - a.length || a.localeCompare(b))
            .map((word, index) => (
              <li key={`${index}-${word}`} className="pill">
                {word}
              </li>
            ))}
        </ul>
      </Grid>
    </>
  );
};

export default Editor;
