import { useState } from "react";
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

  // Handler for input change
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
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
          <Button href={`/?key=${inputValue}`} id="bust-grams">
            Bust grams
          </Button>
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
        </Grid>
      </Grid>
    </>
  );
}

export default App;
