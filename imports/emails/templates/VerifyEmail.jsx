import React, { Component } from "react";
import { FormattedMessage } from "react-intl";

import Grid from "../components/Grid.jsx";
import Intro from "../components/Intro.jsx";
import Title from "../components/Title.jsx";
import Button from "../components/Button.jsx";

class VerifyEmail extends Component {
  render() {
    const { data } = this.props;
    return (
      <Grid>
        <Intro>
          <FormattedMessage
            id="app.email.intro"
            defaultMessage="Hello, {name}!"
            values={{ name: data.user ? data.user.name : "%NAME%" }}
          />
        </Intro>
        <Title>
          <FormattedMessage
            id="app.email.verify_email.title"
            defaultMessage="Verify your email"
          />
        </Title>
        <p>
          <FormattedMessage
            id="app.email.verify_email.text"
            defaultMessage="To verify your email click on the link below."
          />
        </p>
        <Button href={data.url ? data.url : "%URL%"}>
          <FormattedMessage
            id="app.email.verify_email.button_label"
            defaultMessage="Confirm email"
          />
        </Button>
      </Grid>
    );
  }
}

export default VerifyEmail;
