import React from "react";

import Grid from "./Grid.jsx";

const style = {
  wrapper: {
    margin: "0"
  },

  intro: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #ddd"
  }
};

function Intro({ children }) {
  return (
    <Grid style={style.wrapper}>
      <p style={style.intro} className="intro">
        {children}
      </p>
    </Grid>
  );
}

export default Intro;
