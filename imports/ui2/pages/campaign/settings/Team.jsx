import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import { get, set } from "lodash";

import { alertStore } from "../../../containers/Alerts.jsx";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";
import Table from "../../../components/Table.jsx";
import PersonFormInfo from "../../../components/PersonFormInfo.jsx";

export default class CampaignTeamPage extends Component {
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
        { campaignId: campaign._id, email: formData.email, role: "owner" },
        (err, res) => {
          if (err) {
            alertStore.add(err);
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
    const { campaign, user } = this.props;
    const { formData } = this.state;
    return (
      <>
        <Nav campaign={campaign} />
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <h2>Team</h2>
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
                          data-tip="Campaign creator"
                        />
                      ) : null}
                      {campaignUser._id != campaign.creatorId &&
                      campaignUser._id != user._id ? (
                        <a
                          className="remove"
                          href="javascript:void(0);"
                          data-tip="Remover user"
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
            <h3>Add new members</h3>
            <p>
              To add new members the user must be registered in the platform.
              Use the same email used on Facebook.
            </p>
            <Form.Field label="Email">
              <input
                type="email"
                value={formData.email}
                name="email"
                onChange={this._handleChange}
              />
            </Form.Field>
            <input type="submit" value="Add member" />
          </Form.Content>
        </Form>
        <ReactTooltip place="top" effect="solid" />
      </>
    );
  }
}
