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

  const handleLogin = () => {
    window.location.href = "/backend/login";
  };

  const handlePoemClick = (poem) => {
    setSelectedPoem(poem);
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
        <Box
          component="form"
          noValidate
          autoComplete="off"
          action="/backend/poems"
          method="POST"
        >
          <TextField
            id="thing-to-gram"
            label="Enter a name, word, or phrase"
            variant="standard"
            className="custom-textfield"
            value={inputValue}
            onChange={handleInputChange}
            name="key"
          />
          <Box mt={2}>
            <Button id="create-poem-button" disabled={!userInfo} type="submit">
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
      <Typography variant="h2" component="h2" id="your-poems">
        Your Poems
      </Typography>
      <ul className="dictionary left-align" id="poems-list">
        {poems.map((poem, index) => (
          <li
            key={`${index}-${poem}`}
            className={`pill ${selectedPoem === poem ? "selected-poem" : ""}`}
          >
            <a
              href={`?poem=${encodeURIComponent(poem)}`}
              onClick={() => handlePoemClick(poem)}
            >
              {poem}
            </a>
          </li>
        ))}
      </ul>
      {selectedPoem && <Editor keyWord={selectedPoem} />}
    </>
  );
}

export default App;
