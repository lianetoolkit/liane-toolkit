import React, { Component } from "react";
import styled from "styled-components";
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
import Form from "../../../components/Form.jsx";
import Table from "../../../components/Table.jsx";
import Loading from "../../../components/Loading.jsx";
import PersonFormInfo from "../../../components/PersonFormInfo.jsx";
import TeamRolesField, {
  rolesLabels,
} from "../../../components/TeamRolesField.jsx";
import PermissionsField from "../../../components/PermissionsField.jsx";

const messages = defineMessages({
  creatorLabel: {
    id: "app.campaign_settings.team_creator_label",
    defaultMessage: "Campaign creator",
  },
  removeLabel: {
    id: "app.campaign_settings.team_remove_label",
    defaultMessage: "Remove member",
  },
  editLabel: {
    id: "app.campaign_settings.team_edit_label",
    defaultMessage: "Edit member permissions",
  },
  emailLabel: {
    id: "app.campaign_settings.team_email_label",
    defaultMessage: "Email",
  },
  roleLabel: {
    id: "app.campaign_settings.team_role_label",
    defaultMessage: "Member role",
  },
  permissionsLabel: {
    id: "app.campaign_settings.team_permissions_label",
    defaultMessage: "Permissions",
  },
  addButtonLabel: {
    id: "app.campaign_settings.team_add_button_label",
    defaultMessage: "Add member",
  },
  updateButtonLabel: {
    id: "app.campaign_settings.team_update_button_label",
    defaultMessage: "Update member",
  },
});

class EditUser extends Component {
  constructor(props) {
    super(props);
    const { user } = props;
    this.state = {
      loading: false,
      formData: {
        role: user.campaign ? user.campaign.role : user.role,
        permissions: user.campaign
          ? user.campaign.permissions
          : user.permissions,
      },
    };
  }
  _handleChange = ({ target }) => {
    const newFormData = { ...this.state.formData };
    set(newFormData, target.name, target.value);
    this.setState({
      formData: newFormData,
    });
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { campaignId, user } = this.props;
    const { formData } = this.state;
    let data = {
      campaignId,
      role: formData.role,
      permissions: formData.permissions,
    };
    if (user._id) {
      data.userId = user._id;
    } else if (user.inviteId) {
      data.inviteId = user.inviteId;
    } else {
      alertStore.add("Unable to remove", "error");
      return;
    }
    this.setState({ loading: true });
    Meteor.call("campaigns.updateUser", data, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
        modalStore.reset();
      }
      this.setState({ loading: false });
    });
  };
  render() {
    const { user, intl } = this.props;
    const { loading, formData } = this.state;
    if (loading) return <Loading />;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Field label={intl.formatMessage(messages.roleLabel)}>
          <TeamRolesField
            value={formData.role}
            name="role"
            onChange={this._handleChange}
          />
        </Form.Field>

        {formData.role != "admin" ? (
          <Form.Field label={intl.formatMessage(messages.permissionsLabel)}>
            <PermissionsField
              onChange={this._handleChange}
              name="permissions"
              value={formData.permissions}
            />
          </Form.Field>
        ) : null}
        <input
          type="submit"
          value={intl.formatMessage(messages.updateButtonLabel)}
        />
      </Form>
    );
  }
}

EditUser.propTypes = {
  intl: intlShape.isRequired,
};

const EditUserIntl = injectIntl(EditUser);

const Container = styled.div`
  width: 100%;
  display: flex;
  table tr.pending td {
    color: #999;
    font-style: italic;
  }
`;

class CampaignTeamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {
        email: "",
      },
    };
  }
  componentDidUpdate() {
    ReactTooltip.rebuild();
  }
  _handleChange = ({ target }) => {
    const newFormData = { ...this.state.formData };
    set(newFormData, target.name, target.value);
    this.setState({
      formData: newFormData,
    });
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { campaign } = this.props;
    const { formData } = this.state;
    if (formData.email) {
      this.setState({ loading: true });
      Meteor.call(
        "campaigns.addUser",
        {
          campaignId: campaign._id,
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions,
        },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            this.setState({
              formData: {
                ...this.state.formData,
                email: "",
                role: "",
              },
            });
          }
          this.setState({ loading: false });
        }
      );
    } else {
      alertStore.add("Preencha com um email válido", "error");
    }
  };
  _handleEditClick = (campaignId, user) => (ev) => {
    ev.preventDefault();
    modalStore.setTitle(user.name);
    modalStore.set(<EditUserIntl campaignId={campaignId} user={user} />);
  };
  _handleRemoveClick = (user) => (ev) => {
    ev.preventDefault();
    const { campaign } = this.props;
    if (confirm("Tem certeza?")) {
      let data = { campaignId: campaign._id };
      if (user._id) {
        data.userId = user._id;
      } else if (user.inviteId) {
        data.inviteId = user.inviteId;
      } else {
        alertStore.add("Unable to remove", "error");
        return;
      }
      this.setState({ loading: true });
      Meteor.call("campaigns.removeUser", data, (err, res) => {
        if (err) {
          alertStore.add(err);
        }
        this.setState({ loading: false });
      });
    }
  };
  _getRoleLabel = (user) => {
    const { intl, campaign } = this.props;
    const data = user.campaign ? user.campaign : user;
    if (data.role) {
      if (rolesLabels[data.role]) {
        return intl.formatMessage(rolesLabels[data.role]);
      }
    } else if (user._id == campaign.creatorId) return "Admin";
    return data.role;
  };
  render() {
    const { intl, campaign, user } = this.props;
    const { loading, formData } = this.state;
    if (loading) return <Loading />;
    return (
      <Container>
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
                {campaign.users.map((campaignUser) => (
                  <tr
                    key={campaignUser._id || campaignUser.inviteId}
                    className={
                      campaignUser.campaign
                        ? campaignUser.campaign.status
                        : "pending"
                    }
                  >
                    <td>{campaignUser.name || campaignUser.email}</td>
                    <td className="small">
                      {campaignUser.campaign
                        ? campaignUser.campaign.status
                        : "Waiting registration"}
                    </td>
                    <td className="small">
                      {this._getRoleLabel(campaignUser)}
                    </td>
                    <td className="fill small">
                      {campaignUser._id ? campaignUser.emails[0].address : ""}
                    </td>
                    <td>
                      <a
                        href="javascript:void(0);"
                        data-tip={intl.formatMessage(messages.editLabel)}
                        onClick={this._handleEditClick(
                          campaign._id,
                          campaignUser
                        )}
                      >
                        <FontAwesomeIcon icon="edit" />
                      </a>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {campaignUser._id != user._id ? (
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
                defaultMessage="Add new members by adding their email, role and allowed permissons. New users will receive an email invitation."
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
            <Form.Field label={intl.formatMessage(messages.roleLabel)}>
              <TeamRolesField
                value={formData.role}
                name="role"
                onChange={this._handleChange}
              />
            </Form.Field>
            {formData.role != "admin" ? (
              <Form.Field label={intl.formatMessage(messages.permissionsLabel)}>
                <PermissionsField
                  onChange={this._handleChange}
                  name="permissions"
                  value={formData.permissions}
                />
              </Form.Field>
            ) : null}
            <input
              type="submit"
              value={intl.formatMessage(messages.addButtonLabel)}
            />
          </Form.Content>
        </Form>
        <ReactTooltip place="top" effect="solid" />
      </Container>
    );
  }
}

CampaignTeamPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CampaignTeamPage);
