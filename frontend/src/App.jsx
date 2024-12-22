import { useState, useEffect } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Typography } from "@mui/material";

function App() {
  // State to hold the input value
  const [inputValue, setInputValue] = useState("");
  const [commonWords, setCommonWords] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getSearchParams = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("key");
  };
  const fetchCommonWords = async (key) => {
    try {
      const response = await fetch(`/backend/common-words?key=${key}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCommonWords(data);
    } catch (error) {
      console.error("Error fetching words:", error);
    }
  };
  useEffect(() => {
    const key = getSearchParams();
    console.log(`found key ${key}`);
    if (key) {
      fetchCommonWords(key);
    }
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleBustGramsClick = () => {};

  const handleLogin = () => {
    window.location.href = "/backend/login";
  };

  return (
    <>
      <Typography variant="h1" component="h1">
        Anagram Poems
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          id="thing-to-gram"
          label="Enter a name, word, or phrase"
          variant="standard"
          className="custom-textfield"
          value={inputValue}
          onChange={handleInputChange}
        />
        <div>
          <Button
            id="bust-grams"
            disabled={!isLoggedIn}
            onClick={handleBustGramsClick}
          >
            Bust grams
          </Button>
          {!isLoggedIn && (
            <>
              <Typography
                id="requires-login-text"
                variant="body2"
                color="error"
              >
                Requires login
              </Typography>
              <Button
                id="login-button"
                onClick={handleLogin}
                variant="contained"
                color="primary"
              >
                Login
              </Button>
            </>
          )}
        </div>
      </Box>
      <Grid container>
        <Grid item xs={6} className="grid-item left-align">
          <Typography variant="h2" component="h2">
            Lines
          </Typography>
        </Grid>
        <Grid item xs={6} className="grid-item right-align">
          <Typography variant="h2" component="h2">
            Dictionary
          </Typography>
          <ul className="dictionary">
            {commonWords
              .sort((a, b) => b.length - a.length || a.localeCompare(b))
              .map((word, index) => (
                <li key={`${index}-${word}`}>{word}</li>
              ))}
          </ul>
        </Grid>
      </Grid>
    </>
  );
}

export default App;
