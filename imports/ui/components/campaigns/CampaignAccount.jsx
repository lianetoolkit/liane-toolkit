import React, { Component } from "react";
import { Header, Container, Button, Divider } from "semantic-ui-react";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import AccountPeopleContainer from "/imports/ui/containers/people/AccountPeopleContainer.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import moment from "moment";

export default class CampaignAccount extends React.Component {
  constructor(props) {
    super(props);
    this._onClickUpdate = this._onClickUpdate.bind(this);
  }

  _onClickUpdate() {
    const { facebookId } = this.props;
    const campaignId = FlowRouter.getParam("_id");
    Meteor.call(
      "campaigns.updateAccount",
      { facebookId, campaignId },
      (error, data) => {
        if (error) {
          console.log(error);
        } else {
          Alerts.success("Account is being updated");
        }
      }
    );
  }

  render() {
    const { facebookId } = this.props;
    const account = FacebookAccounts.findOne({ facebookId });

    return (
      <Container>
        <Header as="h3" floated="left">
          {account.name}
        </Header>
        <Button floated="right" onClick={this._onClickUpdate}>
          Update
        </Button>
        <Divider hidden section />

        <AccountPeopleContainer facebookId={facebookId} />
      </Container>
    );
  }
}
