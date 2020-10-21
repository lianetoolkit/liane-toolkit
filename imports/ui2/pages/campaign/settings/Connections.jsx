import React, { Component } from "react";
import styled, { css } from "styled-components";
import { OAuth } from "meteor/oauth";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import { get, set } from "lodash";

import { alertStore } from "../../../containers/Alerts.jsx";
import { modalStore } from "../../../containers/Modal.jsx";

import Nav from "./Nav.jsx";
import Page from "../../../components/Page.jsx";
import Form from "../../../components/Form.jsx";
import Table from "../../../components/Table.jsx";
import Loading from "../../../components/Loading.jsx";

const messages = defineMessages({
  reconnect: {
    id: "app.campaign_connections.reconnect_label",
    defaultMessage: "Update connection",
  },
});

const Container = styled.div`
  width: 100%;
  display: flex;
`;

const Connections = styled.ul`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  list-style: none;
  margin: -0.5rem;
  padding: 0;
`;

const ConnectionItem = styled.li`
  padding: 1rem;
  border-radius: 7px;
  border: 1px solid #ddd;
  flex: 1 0 30%;
  margin: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  .connection-icon {
    flex: 0 0 auto;
    font-size: 40px;
    display: flex;
    align-items: center;
    margin-right: 1rem;
    color: #333;
  }
  .connection-content {
    flex: 1 1 50%;
    font-size: 0.8em;
    display: flex;
    flex-wrap: wrap;
    p {
      flex: 1 1 100%;
      margin: 0;
      color: #666;
    }
    h3 {
      flex: 1 1 auto;
      margin: 0;
      font-size: 1.2em;
    }
    p.health {
      flex: 0 0 auto;
      font-weight: 600;
      font-size: 0.9em;
    }
    p.owner {
      color: #999;
      font-style: italic;
    }
  }
  &:hover,
  &:focus {
    cursor: pointer;
    background: #fff;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.075);
  }
  ${(props) =>
    props.facebook &&
    css`
      .connection-icon {
        color: #3b5998;
      }
    `}
`;

const HealthStatus = styled.span`
  background: red;
  box-shadow: 0 0 1rem red;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  margin-right: 0.5rem;
  ${(props) =>
    props.healthy &&
    css`
      background: green;
      box-shadow: 0 0 0.2rem green;
    `}
`;

class CampaignConnectionsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  componentDidUpdate() {
    ReactTooltip.rebuild();
  }
  _getFacebookStatus = () => {
    const { campaign, facebookHealthJob } = this.props;
    return {
      user: campaign.users.find(
        (u) =>
          u.services &&
          u.services.facebook &&
          u.services.facebook.id == campaign.facebookAccount.userFacebookId
      ),
      name: campaign.facebookAccount.name,
      healthy: facebookHealthJob && facebookHealthJob.status != "failed",
    };
  };
  _handleFacebookClick = (ev) => {
    ev.preventDefault();
    const { campaign } = this.props;
    const permissions = [
      "public_profile",
      "email",
      "pages_manage_posts",
      "pages_manage_engagement",
      "pages_manage_metadata",
      "pages_show_list",
      "pages_messaging",
      "pages_messaging_phone_number",
      "pages_messaging_subscriptions",
      "instagram_basic",
      "instagram_manage_insights",
      "instagram_manage_comments"
    ];
    this.setState({ loading: true });
    Facebook.requestCredential(
      {
        requestPermissions: permissions,
      },
      (token) => {
        const secret = OAuth._retrieveCredentialSecret(token) || null;
        Meteor.call(
          "campaigns.updateFacebook",
          { campaignId: campaign._id, token, secret },
          (err, res) => {
            if (err) {
              alertStore.add(err);
            }
            this.setState({ loading: false });
          }
        );
      }
    );
  };
  render() {
    const { intl, campaign, user } = this.props;
    const { loading } = this.state;
    const facebook = this._getFacebookStatus();
    if (loading) return <Loading />;
    return (
      <>
        <Nav campaign={campaign} />
        <Page.Content>
          <h2>
            <FormattedMessage
              id="app.campaign_connections.description"
              defaultMessage="Manage your social network connections"
            />
          </h2>
          <Connections>
            <ConnectionItem
              facebook
              tabIndex="-1"
              data-tip={intl.formatMessage(messages.reconnect)}
              onClick={this._handleFacebookClick}
            >
              <div className="connection-icon">
                <FontAwesomeIcon icon={["fab", "facebook-square"]} />
              </div>
              <div className="connection-content">
                <h3>{facebook.name}</h3>
                <p className="health">
                  <HealthStatus healthy={facebook.healthy} />
                  {facebook.healthy ? (
                    <FormattedMessage
                      id="app.campaign_connections.healthy_label"
                      defaultMessage="Healthy"
                    />
                  ) : (
                    <FormattedMessage
                      id="app.campaign_connections.unhealthy_label"
                      defaultMessage="Not connected"
                    />
                  )}
                </p>
                {facebook.user ? (
                  <p className="owner">
                    <FormattedMessage
                      id="app.campaign_connections.owner_label"
                      defaultMessage="Connected by {name}"
                      values={{ name: facebook.user.name }}
                    />
                  </p>
                ) : (
                  <p className="owner">
                    <FormattedMessage
                      id="app.campaign_connections.owner_not_found_label"
                      defaultMessage="Connection not found"
                    />
                  </p>
                )}
              </div>
            </ConnectionItem>
          </Connections>
        </Page.Content>
        <ReactTooltip place="bottom" effect="solid" />
      </>
    );
  }
}

CampaignConnectionsPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CampaignConnectionsPage);
