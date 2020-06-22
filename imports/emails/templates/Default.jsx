import React, { Component } from "react";

import Grid from "../components/Grid.jsx";
import Intro from "../components/Intro.jsx";
import Title from "../components/Title.jsx";

class DefaultEmail extends Component {
  render() {
    const { title, data } = this.props;
    return (
      <Grid>
        {data.user ? (
          <Intro>
            <FormattedMessage
              id="app.email.intro"
              defaultMessage="Hello, {name}!"
              values={{ name: data.user.name }}
            />
          </Intro>
        ) : null}
        {title ? <Title>{title}</Title> : null}
        <p>{data.text}</p>
      </Grid>
    );
  }
}

export default DefaultEmail;
