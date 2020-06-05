import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import Page from "/imports/ui2/components/Page.jsx";

class MessagesPage extends Component {
  render() {
    return (
      <Page.Content>
        <h2>Messages</h2>
      </Page.Content>
    );
  }
}

MessagesPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(MessagesPage);
