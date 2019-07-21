import React, { Component } from "react";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";

export default class CampaignActionsPage extends Component {
  _handleClick = ev => {
    ev.preventDefault();
    const { campaignId } = this.props;
    if (
      confirm("Are you sure you'd like to permanently remove your campaign?")
    ) {
      Meteor.call("campaigns.remove", { campaignId }, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          FlowRouter.go("App.dashboard");
        }
      });
    }
  };
  render() {
    const { campaign } = this.props;
    if (campaign) {
      return (
        <>
          <Nav campaign={campaign} />
          <Form onSubmit={ev => ev.preventDefault()}>
            <Form.Content>
              <button className="delete" onClick={this._handleClick}>
                Remove campaign and all its data
              </button>
              <hr />
              <p>
                <strong>Attention</strong>: This action is irreversible!
              </p>
            </Form.Content>
          </Form>
        </>
      );
    }
    return null;
  }
}
