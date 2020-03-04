import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import { get, set } from "lodash";

import { alertStore } from "../../../containers/Alerts.jsx";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";
import Table from "../../../components/Table.jsx";
import PersonFormInfo from "../../../components/PersonFormInfo.jsx";
import PermissionsField from "../../../components/PermissionsField.jsx";

const messages = defineMessages({
  creatorLabel: {
    id: "app.campaign_settings.team_creator_label",
    defaultMessage: "Campaign creator"
  },
  removeLabel: {
    id: "app.campaign_settings.team_remove_label",
    defaultMessage: "Remove user"
  },
  emailLabel: {
    id: "app.campaign_settings.team_email_label",
    defaultMessage: "Email"
  },
  permissionsLabel: {
    id: "app.campaign_settings.team_permissions_label",
    defaultMessage: "Permissions"
  },
  addButtonLabel: {
    id: "app.campaign_settings.team_add_button_label",
    defaultMessage: "Add member"
  }
});

class CampaignTeamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        email: ""
      }
    };
  }
  componentDidUpdate() {
    ReactTooltip.rebuild();
  }
  _handleChange = ({ target }) => {
    const newFormData = { ...this.state.formData };
    set(newFormData, target.name, target.value);
    this.setState({
      formData: newFormData
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    const { formData } = this.state;
    if (formData.email) {
      Meteor.call(
        "campaigns.addUser",
        {
          campaignId: campaign._id,
          email: formData.email,
          permissions: formData.permissions
        },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            this.setState({
              formData: {
                ...this.state.formData,
                email: ""
              }
            });
          }
        }
      );
    } else {
      alertStore.add("Preencha com um email válido", "error");
    }
  };
  _handleRemoveClick = user => ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    if (confirm("Tem certeza?")) {
      Meteor.call(
        "campaigns.removeUser",
        { campaignId: campaign._id, userId: user._id },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          }
        }
      );
    }
  };
  render() {
    const { intl, campaign, user } = this.props;
    const { formData } = this.state;
    return (
      <>
        <Nav campaign={campaign} />
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <h2>
              <FormattedMessage
                id="app.campaign_settings.team_title"
                defaultMessage="Team"
              />
            </h2>
            <Table>
              <tbody>
                {campaign.users.map(campaignUser => (
                  <tr key={campaignUser._id}>
                    <td>{campaignUser.name}</td>
                    <td className="fill">{campaignUser.emails[0].address}</td>
                    <td>
                      {campaignUser._id == campaign.creatorId ? (
                        <FontAwesomeIcon
                          icon="star"
                          data-tip={intl.formatMessage(messages.creatorLabel)}
                        />
                      ) : null}
                      {campaignUser._id != campaign.creatorId &&
                      campaignUser._id != user._id ? (
                        <a
                          className="remove"
                          href="javascript:void(0);"
                          data-tip={intl.formatMessage(messages.removeLabel)}
                          onClick={this._handleRemoveClick(campaignUser)}
                        >
                          <FontAwesomeIcon icon="ban" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <h3>
              <FormattedMessage
                id="app.campaign_settings.team_add_title"
                defaultMessage="Add new members"
              />
            </h3>
            <p>
              <FormattedMessage
                id="app.campaign_settings.team_description"
                defaultMessage="To add new members the user must be registered in the platform. Use the same email used on Facebook."
              />
            </p>
            <Form.Field label={intl.formatMessage(messages.emailLabel)}>
              <input
                type="email"
                value={formData.email}
                name="email"
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field label={intl.formatMessage(messages.permissionsLabel)}>
              <PermissionsField
                onChange={this._handleChange}
                name="permissions"
                value={formData.permissions}
              />
            </Form.Field>
            <input
              type="submit"
              value={intl.formatMessage(messages.addButtonLabel)}
            />
          </Form.Content>
        </Form>
        <ReactTooltip place="top" effect="solid" />
      </>
    );
  }
}

CampaignTeamPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CampaignTeamPage);
