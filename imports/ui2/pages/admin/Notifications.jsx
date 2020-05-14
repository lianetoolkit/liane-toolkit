import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import Page from "/imports/ui2/components/Page.jsx";

class NotificationsPage extends Component {
  render() {
    return (
      <Page.Content>
        <h2>Notifications</h2>
      </Page.Content>
    );
  }
}

NotificationsPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NotificationsPage);
