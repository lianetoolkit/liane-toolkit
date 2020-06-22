import React from "react";

import Grid from "./Grid.jsx";

const style = {
  wrapper: {
    width: "auto",
    margin: "0"
  },

  title: {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "0",
    marginBottom: "20px"
  }
};

function Title({ children }) {
  return (
    <Grid style={style.wrapper}>
      <h2 style={style.title} className="title-heading">
        {children}
      </h2>
    </Grid>
  );
}

export default Title;
