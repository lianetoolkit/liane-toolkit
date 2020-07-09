import React, { Component } from "react";
import { FormattedMessage } from "react-intl";

import Grid from "../components/Grid.jsx";
import Intro from "../components/Intro.jsx";
import Title from "../components/Title.jsx";

class DefaultEmail extends Component {
  render() {
    const { title, data } = this.props;
    return (
      <Grid>
        <Intro>
          <FormattedMessage
            id="app.email.intro"
            defaultMessage="Hello, {name}!"
            values={{ name: data.user ? data.user.name : "%NAME%" }}
          />
        </Intro>
        {title ? <Title>{title}</Title> : null}
        <Grid>
          <div dangerouslySetInnerHTML={{ __html: data.content }} />
        </Grid>
      </Grid>
    );
  }
}

export default DefaultEmail;
