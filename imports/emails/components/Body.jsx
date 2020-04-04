import React from "react";

import Grid from "./Grid.jsx";

const style = {
  content: {
    backgroundColor: "white",
    borderRadius: "7px",
    padding: "30px",
    boxShadow: "0 0 10px rgba(0,0,0,0.08)"
  }
};

function Body({ children }) {
  return (
    <Grid>
      <Grid.Cell style={style.content}>{children}</Grid.Cell>
    </Grid>
  );
}

export default Body;
