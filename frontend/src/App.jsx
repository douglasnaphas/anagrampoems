import { useState } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import "./App.css";

function App() {
  return (
    <>
      <h1>Anagram Poems</h1>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          id="standard-basic"
          label="Enter a name, word, or phrase"
          variant="standard"
          className="custom-textfield"
        />
        <div>
          <Button>Bust grams</Button>
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
