import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";
import Loading from "../../../components/Loading.jsx";

const messages = defineMessages({
  confirmRemove: {
    id: "app.campaign_settings.confirm_remove_label",
    defaultMessage:
      "Are you sure you'd like to permanently remove your campaign?",
  },
});

class CampaignActionsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  _handleClick = (ev) => {
    ev.preventDefault();
    const { intl, campaignId } = this.props;
    if (confirm(intl.formatMessage(messages.confirmRemove))) {
      this.setState({ loading: true });
      Meteor.call("campaigns.remove", { campaignId }, (err, data) => {
        this.setState({ loading: false });
        if (err) {
          console.log(err);
        } else {
          window.location = "/";
        }
      });
    }
  };
  render() {
    const { loading } = this.state;
    const { campaign } = this.props;
    if (loading) {
      return <Loading />;
    }
    if (campaign) {
      return (
        <>
          <Nav campaign={campaign} />
          <Form onSubmit={(ev) => ev.preventDefault()}>
            <Form.Content>
              <button className="delete" onClick={this._handleClick}>
                <FormattedMessage
                  id="app.campaign_settings.remove_campaign_label"
                  defaultMessage="Remove campaign and all its data"
                />
              </button>
              <hr />
              <p>
                <FormattedHTMLMessage
                  id="app.campaign_settings.remove_campaign_warning"
                  defaultMessage="<strong>Attention</strong>: This action is irreversible!"
                />
              </p>
            </Form.Content>
          </Form>
        </>
      );
    }
    return null;
  }
}

CampaignActionsPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CampaignActionsPage);
