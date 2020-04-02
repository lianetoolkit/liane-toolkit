import React from "react";

import Grid from "./Grid.jsx";

const style = {
  wrapper: {
    width: "auto",
    margin: "0"
  },

  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginTop: "5px",
    marginBottom: "10px"
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
