import React, { Component } from "react";

import Grid from "./Grid.jsx";
import Img from "./Img.jsx";

class Header extends Component {
  render() {
    return (
      <Grid>
        <h1>
          <a href={Meteor.absoluteUrl()} rel="external" target="_blank">
            <Img
              alt="Liane"
              src={Meteor.absoluteUrl("images/logo_b.png")}
              style={{
                margin: "0 30px"
              }}
            />
          </a>
        </h1>
      </Grid>
    );
  }
}

export default Header;
