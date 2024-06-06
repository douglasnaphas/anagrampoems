import { useState } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function App() {

  return (
    <>
      <h1>Anagram Poems</h1>
      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "25ch" },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField id="outlined-basic" label="Outlined" variant="outlined" />
        <TextField id="filled-basic" label="Filled" variant="filled" />
        <TextField
          id="standard-basic"
          label="Enter a name, word, or phrase"
          variant="standard"
        />
      </Box>
    </>
  );
}

export default App;
