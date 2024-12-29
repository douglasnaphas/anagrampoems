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
import Editor from "./Editor";

function App() {
  // State to hold the input value
  const [inputValue, setInputValue] = useState("");
  const [commonWords, setCommonWords] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

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
  const whoami = async () => {
    try {
      const response = await fetch("/backend/whoami");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching whoami:", error);
    }
  };
  useEffect(() => {
    whoami();
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleBustGramsClick = () => {
    if (inputValue) {
      fetchCommonWords(inputValue);
    }
  };

  const handleLogin = () => {
    window.location.href = "/backend/login";
  };

  return (
    <>
      <Typography variant="h1" component="h1">
        Anagram Poems
      </Typography>
      {userInfo && (
        <Box position="absolute" top={0} right={0} p={2} textAlign="right">
          <Typography variant="body1" id="username-display">
            {userInfo.username}
          </Typography>
          <Typography variant="body2" id="user-email-display">
            {userInfo.user_email}
          </Typography>
          <a href="/backend/logout" id="logout-link">
            Log out
          </a>
        </Box>
      )}
      <div>
        <Button
          id="create-poem-button"
          disabled={!isLoggedIn}
          onClick={handleBustGramsClick}
        >
          Create poem
        </Button>
        {!isLoggedIn && (
          <>
            <Typography id="requires-login-text" variant="body2" color="error">
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
      <Typography variant="h2" component="h2" align="center">
        Try it out
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
        <Button
          id="bust-grams-button"
          onClick={handleBustGramsClick}
          variant="contained"
          color="secondary"
        >
          Bust Grams
        </Button>
      </Box>
      <Grid container>
        <Editor dictionary={commonWords} keyWord={inputValue} />
      </Grid>
    </>
  );
}

export default App;
