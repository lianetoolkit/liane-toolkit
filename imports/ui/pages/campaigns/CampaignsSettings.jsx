import React from "react";
import PropTypes from "prop-types";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import AdAccountField from "/imports/ui/components/facebook/AdAccountField.jsx";
import _ from "underscore";

import {
  Grid,
  Header,
  Segment,
  Button,
  Form,
  Input,
  Select,
  Table,
  Menu,
  Icon
} from "semantic-ui-react";

export default class CampaignsSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        general: {},
        team: {}
      },
      section: "general"
    };
    this._handleNav = this._handleNav.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleRemove = this._handleRemove.bind(this);
    this._handleRemoveUser = this._handleRemoveUser.bind(this);
  }
  componentDidMount() {
    const { campaign } = this.props;
    if (campaign) {
      this.setState({
        formData: {
          ...this.state.formData,
          general: campaign
        }
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { campaign } = this.props;
    if (nextProps.campaign !== campaign) {
      if (nextProps.campaign) {
        this.setState({
          formData: {
            ...this.state.formData,
            general: nextProps.campaign
          }
        });
      } else {
        this.setState({
          formData: {
            ...this.state.formData,
            general: {}
          }
        });
      }
    }
  }
  _handleNav(section) {
    return () => {
      this.setState({ section });
    };
  }
  _handleSubmit(ev) {
    ev.preventDefault();
    const { campaign } = this.props;
    const { section, formData } = this.state;
    let data = {};
    for (const key in formData[section]) {
      if (formData[section][key]) {
        data[key] = formData[section][key];
      }
    }
    switch (section) {
      case "general":
        data = _.pick(data, ["name", "adAccountId"]);
        Meteor.call(
          "campaigns.update",
          { ...data, campaignId: campaign._id },
          (error, result) => {
            if (error) {
              console.log(error);
              Alerts.error(error);
            } else {
              Alerts.success("Campaign updated successfully.");
            }
          }
        );
        break;
      case "team":
        Meteor.call(
          "campaigns.addUser",
          { ...data, campaignId: campaign._id },
          (error, result) => {
            if (error) {
              console.log(error);
              Alerts.error(error);
            } else {
              Alerts.success("User added successfully.");
            }
          }
        );
        break;
    }
  }
  _handleChange(ev, { name, value }) {
    const { formData, section } = this.state;
    this.setState({
      formData: {
        ...formData,
        [section]: {
          ...formData[section],
          [name]: value
        }
      }
    });
  }
  _handleRemove(e) {
    e.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        const { campaign } = this.props;
        this.setState({ isLoading: true });
        if (campaign) {
          Meteor.call(
            "campaigns.remove",
            { campaignId: campaign._id },
            error => {
              this.setState({ isLoading: false });
              if (error) {
                Alerts.error(error);
              } else {
                Alerts.success("Campaign removed successfully");
                this.context.confirmStore.hide();
                FlowRouter.go("App.dashboard");
              }
            }
          );
        }
      }
    });
  }
  _handleRemoveUser = userId => ev => {
    ev.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        const { campaign } = this.props;
        Meteor.call(
          "campaigns.removeUser",
          {
            campaignId: campaign._id,
            userId
          },
          error => {
            this.context.confirmStore.hide();
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("User removed successfully");
            }
          }
        );
      }
    });
  };
  render() {
    const { formData, section } = this.state;
    const { loading, campaign, currentUser } = this.props;
    const { users } = campaign;
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Campaign Settings"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <div>
              <Menu>
                <Menu.Item
                  active={section == "general"}
                  onClick={this._handleNav("general")}
                >
                  General Settings
                </Menu.Item>
                <Menu.Item
                  active={section == "team"}
                  onClick={this._handleNav("team")}
                >
                  Team
                </Menu.Item>
                <Menu.Item
                  active={section == "actions"}
                  onClick={this._handleNav("actions")}
                >
                  Actions
                </Menu.Item>
              </Menu>
              <Segment.Group>
                <Segment>
                  <Form onSubmit={this._handleSubmit}>
                    {section == "general" ? (
                      <div>
                        <Form.Field
                          control={Input}
                          label="Campaign name"
                          name="name"
                          value={formData.general.name}
                          onChange={this._handleChange}
                        />
                        <AdAccountField
                          label="Ad Account"
                          name="adAccountId"
                          value={formData.general.adAccountId}
                          onChange={this._handleChange}
                        />
                        <Button fluid primary>
                          Save
                        </Button>
                      </div>
                    ) : null}
                    {section == "team" ? (
                      <div>
                        <Table>
                          <Table.Body>
                            {users.map(user => (
                              <Table.Row key={user._id}>
                                <Table.Cell>{user.name}</Table.Cell>
                                <Table.Cell>{user.campaign.role}</Table.Cell>
                                <Table.Cell>
                                  {user._id !== currentUser._id ? (
                                    <a
                                      href="#"
                                      onClick={this._handleRemoveUser(user._id)}
                                    >
                                      Remove
                                    </a>
                                  ) : null}
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                        <Segment>
                          <Header size="small">Add user</Header>
                          <Form.Group widths="equal">
                            <Form.Field
                              control={Input}
                              label="User email"
                              name="email"
                              value={formData.team.email}
                              onChange={this._handleChange}
                            />
                            <Form.Field
                              control={Select}
                              label="User role"
                              name="role"
                              value={formData.team.role}
                              onChange={this._handleChange}
                              options={[
                                {
                                  key: "guest",
                                  value: "guest",
                                  text: "Guest"
                                },
                                {
                                  key: "manager",
                                  value: "manager",
                                  text: "Manager"
                                },
                                {
                                  key: "owner",
                                  value: "owner",
                                  text: "Owner"
                                }
                              ]}
                            />
                          </Form.Group>
                          <Button fluid primary>
                            Add user to your campaign
                          </Button>
                        </Segment>
                      </div>
                    ) : null}
                    {section == "actions" ? (
                      <div>
                        <Button fluid negative onClick={this._handleRemove}>
                          <Icon name="trash" />
                          Detele campaign and all its data
                        </Button>
                      </div>
                    ) : null}
                  </Form>
                </Segment>
              </Segment.Group>
            </div>
          )}
        </section>
      </div>
    );
  }
}

CampaignsSettings.contextTypes = {
  confirmStore: PropTypes.object
};
