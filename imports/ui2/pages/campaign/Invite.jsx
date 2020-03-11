import React, { Component } from "react";
import styled from "styled-components";

import { alertStore } from "../../containers/Alerts.jsx";

import Page from "../../components/Page.jsx";
import Table from "../../components/Table.jsx";
import Button from "../../components/Button.jsx";

const Container = styled.div`
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
  padding: 2rem;
  table {
    margin-bottom: 2rem;
  }
`;

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
        <Page.Content>
          <Container>
            <p>You've been invited to be a part of a campaign</p>
            <Table>
              <tbody>
                <tr>
                  <th>Campaign</th>
                  <td className="fill">{campaign.name}</td>
                </tr>
                <tr>
                  <th>Candidate</th>
                  <td className="fill">{campaign.candidate}</td>
                </tr>
                <tr>
                  <th>Party/movement/coalition</th>
                  <td className="fill">{campaign.party}</td>
                </tr>
                <tr>
                  <th>Office</th>
                  <td className="fill">{campaign.office}</td>
                </tr>
              </tbody>
            </Table>
            <Button.Group>
              <Button onClick={this._handleDeclineClick}>Decline</Button>
              <Button onClick={this._handleAcceptClick}>Accept</Button>
            </Button.Group>
          </Container>
        </Page.Content>
      );
    }
    return null;
  }
}

export default CampaignInvitePage;
