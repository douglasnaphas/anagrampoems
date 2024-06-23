import { useState } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "./App.css";

function App() {
  // State to hold the input value
  const [inputValue, setInputValue] = useState("");

  // Handler for input change
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
  return (
    <>
      <h1>Anagram Poems</h1>
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
          <Button href={`/?key=${inputValue}`} id="bust-grams">
            Bust grams
          </Button>
        </div>
      </Box>
      <Grid container>
        <Grid item xs={6} className="grid-item left-align">
          <h2>Lines</h2>
        </Grid>
        <Grid item xs={6} className="grid-item right-align">
          <h2>Dictionary</h2>
        </Grid>
      </Grid>
    </>
  );
}

export default App;
