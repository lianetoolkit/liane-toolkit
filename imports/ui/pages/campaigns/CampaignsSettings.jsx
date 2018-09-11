import React from "react";
import PropTypes from "prop-types";
import { setWith, clone } from "lodash";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import AdAccountField from "/imports/ui/components/facebook/AdAccountField.jsx";
import FacebookAccountField from "/imports/ui/components/facebook/FacebookAccountField.jsx";
import SelectFacebookAccount from "/imports/ui/components/facebook/SelectFacebookAccount.jsx";
import { getFormUrl } from "/imports/ui/components/people/Utils.jsx";
import _ from "underscore";

import {
  Grid,
  Header,
  List,
  Segment,
  Button,
  Form,
  Input,
  TextArea,
  Select,
  Table,
  Menu,
  Icon,
  Divider,
  Message
} from "semantic-ui-react";

export default class CampaignsSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        general: {},
        forms: {
          crm: {}
        },
        accounts: {},
        team: {}
      },
      section: "general"
    };
    this._handleNav = this._handleNav.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleRemove = this._handleRemove.bind(this);
    this._handleRemoveAudienceAccount = this._handleRemoveAudienceAccount.bind(
      this
    );
    this._handleRemoveUser = this._handleRemoveUser.bind(this);
  }
  componentDidMount() {
    const { campaign } = this.props;
    if (campaign) {
      this.setState({
        formData: {
          ...this.state.formData,
          general: campaign,
          forms: campaign.forms ? campaign.forms : { crm: {} }
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
            general: nextProps.campaign,
            forms: nextProps.campaign.forms
              ? nextProps.campaign.forms
              : { crm: {} }
          }
        });
      } else {
        this.setState({
          formData: {
            ...this.state.formData,
            general: {},
            forms: { crm: {} }
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
      if (typeof formData[section][key] !== "undefined") {
        data[key] = formData[section][key];
      }
    }
    switch (section) {
      case "general":
        data = _.pick(data, ["name", "adAccountId", "autoReplyMessage"]);
        Meteor.call(
          "campaigns.update",
          { ...data, campaignId: campaign._id },
          (error, result) => {
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("Campaign updated successfully.");
            }
          }
        );
        break;
      case "forms":
        Meteor.call(
          "campaigns.update",
          {
            forms: { ...data },
            campaignId: campaign._id
          },
          (error, result) => {
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("Form settings updated successfully");
            }
          }
        );
        break;
      case "accounts":
        if (data.audienceAccount) {
          Meteor.call(
            "campaigns.findAndAddSelfAudienceAccount",
            {
              campaignId: campaign._id,
              address: data.audienceAccount
            },
            (error, result) => {
              if (error) {
                Alerts.error(error);
              } else {
                this.setState({
                  formData: {
                    ...formData,
                    accounts: {
                      audienceAccount: ""
                    }
                  }
                });
                Alerts.success("Audience account added successfully.");
              }
            }
          );
        }
        break;
      case "team":
        Meteor.call(
          "campaigns.addUser",
          { ...data, campaignId: campaign._id },
          (error, result) => {
            if (error) {
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
    let newFormData = Object.assign({}, this.state.formData);
    newFormData[section] = setWith(
      clone(newFormData[section]),
      name,
      value,
      clone
    );
    this.setState({
      formData: newFormData
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
  _handleRemoveAccount = facebookId => ev => {
    ev.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        const { campaign } = this.props;
        Meteor.call(
          "campaigns.removeSelfAccount",
          {
            campaignId: campaign._id,
            facebookId
          },
          error => {
            this.context.confirmStore.hide();
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("Account removed successfully.");
            }
          }
        );
      }
    });
  };
  _handleRemoveAudienceAccount = facebookId => ev => {
    ev.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        const { campaign } = this.props;
        Meteor.call(
          "campaigns.removeSelfAudienceAccount",
          {
            campaignId: campaign._id,
            facebookId
          },
          error => {
            this.context.confirmStore.hide();
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("Audience Account removed successfully.");
            }
          }
        );
      }
    });
  };
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
    const { accounts, users } = campaign;
    const formUrl = getFormUrl(campaign);
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
                  active={section == "forms"}
                  onClick={this._handleNav("forms")}
                >
                  Forms Settings
                </Menu.Item>
                <Menu.Item
                  active={section == "accounts"}
                  onClick={this._handleNav("accounts")}
                >
                  Facebook Accounts
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
              {campaign.status == "suspended" ? (
                <Message negative>Your campaign is suspended.</Message>
              ) : null}
              <Segment.Group>
                <Segment>
                  <Form onSubmit={this._handleSubmit}>
                    {section == "general" ? (
                      <div>
                        <p>
                          Your campaign is associated to the context{" "}
                          <strong>{campaign.context.name}</strong>
                        </p>
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
                        <Form.Field
                          control={TextArea}
                          label="Automatic message for private replies"
                          name="autoReplyMessage"
                          value={formData.general.autoReplyMessage}
                          onChange={this._handleChange}
                        />
                        <p
                          style={{
                            marginTop: "-.6rem",
                            color: "#999",
                            fontSize: ".9em"
                          }}
                        >
                          You can use <code>[form]</code> shortcode for
                          automatic placement of the form url and{" "}
                          <code>[name]</code> for automatic name replacement.<br />
                          Example: Hi [name], thank you for your comment! Help
                          the campaign by filling out this form: [form]
                        </p>
                        <Button fluid primary>
                          Save
                        </Button>
                      </div>
                    ) : null}
                    {section == "accounts" ? (
                      <div>
                        <Grid>
                          <Grid.Row columns={2}>
                            <Grid.Column>
                              <Header as="h3">Campaign Accounts</Header>
                              {campaign.accounts.length ? (
                                <List divided verticalAlign="middle">
                                  {campaign.accounts.map(account => {
                                    return (
                                      <List.Item key={account._id}>
                                        <List.Content floated="right">
                                          <Button
                                            negative
                                            onClick={this._handleRemoveAccount(
                                              account.facebookId
                                            )}
                                          >
                                            Remove
                                          </Button>
                                        </List.Content>
                                        <List.Icon name="facebook square" />
                                        <List.Content>
                                          <List.Header>
                                            {account.name}
                                          </List.Header>
                                          {account.category}
                                        </List.Content>
                                      </List.Item>
                                    );
                                  })}
                                </List>
                              ) : (
                                "You do not have associated accounts for this campaign"
                              )}
                            </Grid.Column>
                            <Grid.Column>
                              <SelectFacebookAccount
                                campaignId={campaign._id}
                                selectedAccountsIds={_.pluck(
                                  accounts,
                                  "facebookId"
                                )}
                              />
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                      </div>
                    ) : null}
                    {section == "forms" ? (
                      <div>
                        <Header as="h3">CRM Form</Header>
                        <p>
                          Your generic form URL is:{" "}
                          <strong>
                            <a href={formUrl} target="_blank">
                              {formUrl}
                            </a>
                          </strong>
                        </p>
                        <Form.Field
                          control={Input}
                          name="slug"
                          label="Form slug (name in URL)"
                          placeholder="my-campaign"
                          onChange={this._handleChange}
                          value={formData.forms.slug}
                        />
                        <Form.Field
                          control={Input}
                          name="crm.header"
                          label="Header text"
                          placeholder="Type an introduction header"
                          onChange={this._handleChange}
                          value={formData.forms.crm.header}
                        />
                        <Form.Field
                          control={TextArea}
                          name="crm.text"
                          label="Introduction text"
                          placeholder="Type an introcution text"
                          onChange={this._handleChange}
                          value={formData.forms.crm.text}
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
                                <Table.Cell collapsing>
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
