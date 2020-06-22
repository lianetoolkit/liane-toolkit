import React, { Component } from "react";
import { FormattedMessage } from "react-intl";

import Grid from "../components/Grid.jsx";
import Intro from "../components/Intro.jsx";
import Title from "../components/Title.jsx";
import Button from "../components/Button.jsx";

class ResetPassword extends Component {
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
            id="app.email.reset_password.title"
            defaultMessage="Reset password"
          />
        </Title>
        <p>
          <FormattedMessage
            id="app.email.reset_password.intro"
            defaultMessage="We've received a request to reset your password."
          />
        </p>
        <p>
          <FormattedMessage
            id="app.email.reset_password.text"
            defaultMessage="If you didn't request this password reset, ignore this email; otherwise, click on the link below to be redirected to a secure page where you can define a new password."
          />
        </p>
        <Button href={data.url ? data.url : "%URL%"}>
          <FormattedMessage
            id="app.email.reset_password.button_label"
            defaultMessage="Reset your password"
          />
        </Button>
      </Grid>
    );
  }
}

export default ResetPassword;
