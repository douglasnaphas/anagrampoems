import { useState, useEffect } from "react";
import * as React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Box, Typography, Link, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Editor from "./Editor";

function App() {
  // State to hold the input value
  const [inputValue, setInputValue] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [poems, setPoems] = React.useState([]);
  const [selectedPoem, setSelectedPoem] = React.useState("");
  const [openDialog, setOpenDialog] = useState(false);

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
      if (getPoemsData.length > 0) setSelectedPoem(getPoemsData[0]);
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

  const handlePoemChange = (event) => {
    setSelectedPoem(event.target.value);
  };

  const handleDeleteClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeletePoem = async () => {
    try {
      const response = await fetch(
        `/backend/poems?key=${encodeURIComponent(selectedPoem)}`,
        {
          method: "DELETE",
        }
      );
      if (response.status !== 204) {
        throw new Error("Network response was not ok, deleting poem");
      }
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting poem:", error);
    }
  };

  return (
    <>
      <Typography variant="h1" component="h1">
        Anagram Poems
      </Typography>
      <Box
        position="absolute"
        top={0}
        right={0}
        p={2}
        textAlign="right"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "2px",
        }}
      >
        {userInfo ? (
          <>
            <Typography variant="body1" id="username-display">
              {userInfo.username}
            </Typography>
            <Typography variant="body2" id="user-email-display">
              {userInfo.user_email}
            </Typography>
            <a href="/backend/logout" id="logout-link">
              Log out
            </a>
            <Link
              href="https://github.com/douglasnaphas/anagrampoems"
              target="_blank"
              rel="noopener"
              underline="hover"
              color="text.secondary"
              id="about-link"
              sx={{ fontSize: "1rem", fontWeight: 400, mt: 0.5 }}
            >
              About
            </Link>
          </>
        ) : (
          <Link
            href="https://github.com/douglasnaphas/anagrampoems"
            target="_blank"
            rel="noopener"
            underline="hover"
            color="text.secondary"
            id="about-link"
            sx={{ fontSize: "1rem", fontWeight: 400 }}
          >
            About
          </Link>
        )}
      </Box>

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
            <Button
              id="create-poem-button"
              disabled={!userInfo || !inputValue}
              type="submit"
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
      <Typography variant="h2" component="h2" id="your-poems">
        Your Poems
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}>
        <FormControl sx={{ minWidth: 350 }}>
          <InputLabel id="poem-select-label">Select a Poem</InputLabel>
          <Select
            labelId="poem-select-label"
            id="poem-select"
            value={selectedPoem}
            label="Select a Poem"
            onChange={handlePoemChange}
            sx={{ minWidth: 350, maxWidth: 600 }}
          >
            {poems.map((poemKey) => (
              <MenuItem key={poemKey} value={poemKey}>
                {poemKey}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* Render Editor for selected poem */}
      {selectedPoem && <Editor keyWord={selectedPoem} />}
      {selectedPoem && (
        <>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              id="delete-poem-button"
              variant="outlined"
              color="error"
              onClick={handleDeleteClick}
            >
              Delete Poem
            </Button>
          </Box>
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Delete the poem for " + selectedPoem + "?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete the poem for "{selectedPoem}"?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                id="cancel-delete-poem-button"
                onClick={handleCloseDialog}
                color="primary"
                variant="contained"
                autoFocus
              >
                Cancel
              </Button>
              <Button
                id="confirm-delete-poem-button"
                onClick={handleDeletePoem}
                color="error"
                variant="outlined"
              >
                Yes, delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
}

export default App;
