import * as React from "react";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";

const Editor = ({ dictionary, keyWord }) => {
  return (
    <>
      <Grid item xs={6} className="grid-item left-align">
        <Typography variant="h3" component="h3">
          Lines
        </Typography>
        <ul className="lines">
          <li key="keyWord" className="pill">
            {keyWord}
          </li>
        </ul>
      </Grid>
      <Grid item xs={6} className="grid-item right-align">
        <Typography variant="h3" component="h3">
          Dictionary
        </Typography>
        <ul className="dictionary">
          {dictionary
            .sort((a, b) => b.length - a.length || a.localeCompare(b))
            .map((word, index) => (
              <li key={`${index}-${word}`} className="pill">
                {word}
              </li>
            ))}
        </ul>
      </Grid>
    </>
  );
};

export default Editor;
