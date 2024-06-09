import { useState } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import './App.css';

function App() {

  return (
    <>
      <h1>Anagram Poems</h1>
      <Box
        component="form"
        noValidate
        autoComplete="off"
      >
        <TextField
          id="standard-basic"
          label="Enter a name, word, or phrase"
          variant="standard"
          className="custom-textfield"
        />
      </Box>
    </>
  );
}

export default App;
