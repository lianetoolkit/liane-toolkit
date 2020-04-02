import React, { Component } from "react";
import { FormattedMessage, injectIntl, intlShape } from "react-intl";
import { messages } from "/locales/features/notifications";

import Email from "../components/Email.jsx";
import Title from "../components/Title.jsx";

class Notification extends Component {
  _getText = () => {
    const { category, text, intl, metadata } = this.props;
    if (messages[category])
      return intl.formatMessage(messages[category], metadata || {});

    return text;
  };
  render() {
    const { data } = this.props;
    return (
      <>
        <Title>
          <FormattedMessage
            id="app.email.notification.title"
            defaultMessage="You have a new notification"
          />
        </Title>
        <p>Notification content here</p>
      </>
    );
  }
}

Notification.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Notification);
