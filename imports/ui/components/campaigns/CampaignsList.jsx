import React, { Component } from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import {
  Header,
  Container,
  List,
  Link,
  Divider,
  Button,
  Icon
} from "semantic-ui-react";
import { isFbLogged } from "/imports/ui/utils/utils.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import moment from "moment";

export default class CampaignsList extends React.Component {
  constructor(props) {
    super(props);
    this._handleItemClick = this._handleItemClick.bind(this);
  }
  _handleItemClick() {
    const { currentUser } = this.props;
    if (currentUser && isFbLogged(currentUser)) {
      FlowRouter.go("App.addCampaign");
    } else {
      Alerts.error("You need to login with facebook first");
      return;
    }
  }
  render() {
    const { loading, campaigns } = this.props;
    if (loading) {
      return <Loading />;
    } else {
      return (
        <Container>
          <Header as="h3">Your Campaigns</Header>
          <Divider hidden />
          {campaigns && campaigns.length ? (
            <div>
              <List divided relaxed>
                {campaigns.map(campaign => {
                  return (
                    <List.Item key={campaign._id}>
                      <List.Content floated="right">
                        {moment(campaign.createdAt).format("LL")}
                      </List.Content>
                      <List.Icon name="folder" />

                      <List.Content>
                        <List.Header
                          as="a"
                          href={FlowRouter.path("App.campaignDetail", {
                            campaignId: campaign._id
                          })}
                        >
                          {campaign.name}
                        </List.Header>
                        <List.Description as="a">
                          {campaign.description}
                        </List.Description>
                      </List.Content>
                    </List.Item>
                  );
                })}
              </List>
              <Divider />
            </div>
          ) : null}
          <Button onClick={this._handleItemClick}>
            <Icon name="plus" /> {i18n.__("components.userMenu.newCampaign")}
          </Button>
        </Container>
      );
    }
  }
}
