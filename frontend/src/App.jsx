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
  const [userInfo, setUserInfo] = useState(null);
  const [poems, setPoems] = useState([]);
  const [selectedPoem, setSelectedPoem] = useState(null);

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
  const getPoems = async () => {
    try {
      const response = await fetch("/backend/poems");
      if (!response.ok) {
        throw new Error("Network response was not ok to GET /backend/poems");
      }
      const getPoemsData = await response.json();
      setPoems(getPoemsData);
    } catch (error) {
      console.error("Error fetching GET /backend/poems:", error);
    }
  };
  useEffect(() => {
    getPoems();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const poem = params.get("poem");
    if (poem) {
      const decodedPoem = decodeURIComponent(poem);
      setSelectedPoem(decodedPoem);
    }
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleCreatePoem = async () => {
    // post to /backend/poems
    // include the input value in the body
    try {
      const response = await fetch("/backend/poems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: inputValue }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok to /backend/poems");
      }
      const createPoemData = await response.json();
    } catch (error) {
      console.error("Error fetching POST /backend/poems:", error);
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
        <Box component="form" noValidate autoComplete="off">
          <TextField
            id="thing-to-gram"
            label="Enter a name, word, or phrase"
            variant="standard"
            className="custom-textfield"
            value={inputValue}
            onChange={handleInputChange}
          />
          <Box mt={2}>
            <Button
              id="create-poem-button"
              disabled={!userInfo}
              onClick={handleCreatePoem}
            >
              Create poem
            </Button>
          </Box>
          {!userInfo && (
            <>
              <Typography
                id="requires-login-text"
                variant="body2"
                color="error"
              >
                Requires login
              </Typography>
            </>
          )}
        </Box>
        {!userInfo && (
          <>
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
      <Typography variant="h2" component="h2">
        Your Poems
      </Typography>
      <ul className="dictionary left-align">
        {poems.map((poem, index) => (
          <li key={`${index}-${poem}`} className="pill">
            <a href={`?poem=${encodeURIComponent(poem)}`}>{poem}</a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
