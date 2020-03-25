import React, { Component } from "react";
import styled from "styled-components";

import { FormattedMessage } from "react-intl";

import { alertStore } from "../../containers/Alerts.jsx";

import Page from "../../components/Page.jsx";
import Table from "../../components/Table.jsx";
import Button from "../../components/Button.jsx";

class CampaignInvitePage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    const { campaignInviteId } = this.props;
    if (campaignInviteId) {
      Meteor.call(
        "campaigns.perInvite",
        { campaignId: campaignInviteId },
        (err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log(res);
            this.setState({
              campaign: res
            });
          }
        }
      );
    }
  }
  _handleDeclineClick = ev => {
    ev.preventDefault();
    const { campaignInviteId } = this.props;
    Meteor.call(
      "campaigns.declineInvite",
      { campaignId: campaignInviteId },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          FlowRouter.go("/");
        }
      }
    );
  };
  _handleAcceptClick = ev => {
    ev.preventDefault();
    const { campaignInviteId } = this.props;
    Meteor.call(
      "campaigns.acceptInvite",
      { campaignId: campaignInviteId },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          FlowRouter.go("/");
        }
      }
    );
  };
  render() {
    const { campaignInviteId } = this.props;
    const { campaign } = this.state;
    if (campaign) {
      return (
        <Page.Boxed>
          <div className="info">
            <p>
              <FormattedMessage
                id="app.campaign_invite.text"
                defaultMessage="You've been invited to be a part of a campaign!"
              />
            </p>
            <Table>
              <tbody>
                <tr>
                  <th>
                    <FormattedMessage
                      id="app.campaign_invite.campaign_label"
                      defaultMessage="Campaign"
                    />
                  </th>
                  <td className="fill">{campaign.name}</td>
                </tr>
                <tr>
                  <th>
                    <FormattedMessage
                      id="app.campaign_invite.candidate_label"
                      defaultMessage="Candidate"
                    />
                  </th>
                  <td className="fill">{campaign.candidate}</td>
                </tr>
                <tr>
                  <th>
                    <FormattedMessage
                      id="app.campaign_invite.party_label"
                      defaultMessage="Party/movement/coalition"
                    />
                  </th>
                  <td className="fill">{campaign.party}</td>
                </tr>
                <tr>
                  <th>
                    <FormattedMessage
                      id="app.campaign_invite.office_label"
                      defaultMessage="Office"
                    />
                  </th>
                  <td className="fill">{campaign.office}</td>
                </tr>
              </tbody>
            </Table>
          </div>
          <Button.Group>
            <Button onClick={this._handleDeclineClick}>
              <FormattedMessage
                id="app.campaign_invite.decline_label"
                defaultMessage="Decline"
              />
            </Button>
            <Button primary onClick={this._handleAcceptClick}>
              <FormattedMessage
                id="app.campaign_invite.accept_label"
                defaultMessage="Accept"
              />
            </Button>
          </Button.Group>
        </Page.Boxed>
      );
    }
    return null;
  }
}

export default CampaignInvitePage;
