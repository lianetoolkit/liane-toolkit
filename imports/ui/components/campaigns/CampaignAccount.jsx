import React, { Component } from "react";
import {
  Header,
  Container,
  Button,
  Divider,
  Segment,
  Tab
} from "semantic-ui-react";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import PeopleTable from "/imports/ui/components/people/PeopleTable.jsx";
import EntriesTable from "/imports/ui/components/entries/EntriesTable.jsx";
import AudiencesTable from "/imports/ui/components/audiences/AudiencesTable.jsx";
import AudiencesIndexTable from "/imports/ui/components/audiences/AudiencesIndexTable.jsx";
import AudiencesChartsContainer from "/imports/ui/containers/audiences/AudiencesChartsContainer.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import moment from "moment";

export default class CampaignAccount extends React.Component {
  constructor(props) {
    super(props);
    this._onClickUpdate = this._onClickUpdate.bind(this);
  }

  _onClickUpdate(e) {
    const { facebookId } = this.props;
    const action = e.target.name;
    const campaignId = FlowRouter.getParam("campaignId");
    Meteor.call(
      "campaigns.updateAccount",
      { facebookId, campaignId, action },
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
    const { campaignId, facebookId, contextId } = this.props;
    const account = FacebookAccounts.findOne({ facebookId });
    const panes = [
      {
        menuItem: { key: "people", icon: "user", content: "People" },
        render: () => (
          <Tab.Pane attached={false}>
            <Segment basic clearing>
              <Button
                onClick={this._onClickUpdate}
                floated="right"
                name="people"
              >
                Update
              </Button>
            </Segment>
            <PeopleTable
              facebookAccount={facebookId}
              selector={{
                campaignId,
                facebookAccounts: { $in: [facebookId] }
              }}
            />
          </Tab.Pane>
        )
      },
      {
        menuItem: { key: "entries", icon: "browser", content: "Entries" },
        render: () => (
          <Tab.Pane attached={false}>
            <Segment basic clearing>
              <Button
                onClick={this._onClickUpdate}
                floated="right"
                name="people"
              >
                Update
              </Button>
            </Segment>
            <EntriesTable
              selector={{
                facebookAccountId: facebookId
              }}
            />
          </Tab.Pane>
        )
      }
    ];
    return (
      <Container>
        <Tab menu={{ pointing: true }} panes={panes} />
      </Container>
    );
  }
}
