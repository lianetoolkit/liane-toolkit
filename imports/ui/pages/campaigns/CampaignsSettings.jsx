import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import {
  Grid,
  Header,
  Segment,
  Button,
  Form,
  Input,
  Table,
  Menu
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
  }
  componentDidMount() {
    const { campaign } = this.props;
    if (campaign) {
      this.setState({
        formData: {
          general: {
            name: campaign.name
          }
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
            general: {
              name: nextProps.campaign.name
            }
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
  _role(user) {
    const { campaign } = this.props;
    const campaignUser = campaign.users.find(u => u.userId == user._id);
    if (campaignUser) {
      return campaignUser.role;
    }
    return "";
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
    const data = formData[section];
    switch (section) {
      case "general":
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
  render() {
    const { formData, section } = this.state;
    const { loading, campaign, users } = this.props;
    console.log(users);
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
                                <Table.Cell>{this._role(user)}</Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                        <Header size="small">Add user</Header>
                        <Form.Field
                          control={Input}
                          label="User email"
                          name="email"
                          value={formData.team.email}
                          onChange={this._handleChange}
                        />
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
