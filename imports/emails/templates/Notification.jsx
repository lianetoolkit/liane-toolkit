import React, { Component } from "react";
import { FormattedMessage, injectIntl, intlShape } from "react-intl";

import { messages } from "/locales/features/notifications";

import Grid from "../components/Grid.jsx";
import Title from "../components/Title.jsx";
import Intro from "../components/Intro.jsx";
import Button from "../components/Button.jsx";

class Notification extends Component {
  _getText = () => {
    const { intl } = this.props;
    const { category, text, metadata } = this.props.data;
    if (messages[category])
      return intl.formatMessage(messages[category], metadata || {});

    return text;
  };
  render() {
    const { data } = this.props;
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
        <Title>
          <FormattedMessage
            id="app.email.notification.title"
            defaultMessage="You have a new notification"
          />
        </Title>
        <p>{this._getText()}</p>
        {data.path ? (
          <Button href={Meteor.absoluteUrl(data.path)}>
            <FormattedMessage
              id="app.email.notification_button_label"
              defaultMessage="View more"
            />
          </Button>
        ) : null}
      </Grid>
    );
  }
}

Notification.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Notification);
