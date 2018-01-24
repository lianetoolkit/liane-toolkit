import React, { Component } from "react";
import { Header, Container, List, Link, Divider } from "semantic-ui-react";
import moment from "moment";

export default class CampaignsList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { loading, campaigns } = this.props;
    return (
      <Container>
        <Header as="h3">Your Campaigns</Header>
        <Divider hidden />
        {loading ? (
          ""
        ) : (
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
        )}
      </Container>
    );
  }
}
