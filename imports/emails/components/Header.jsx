import React, { Component } from "react";

import Grid from "./Grid.jsx";
import Img from "./Img.jsx";

class Header extends Component {
  render() {
    return (
      <Grid>
        <h1>
          <Img
            alt="Liane"
            src={Meteor.absoluteUrl("images/logo_b.png")}
            style={{
              margin: "0 30px"
            }}
          />
        </h1>
      </Grid>
    );
  }
}

export default Header;
