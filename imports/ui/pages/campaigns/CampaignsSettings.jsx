import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";

import {
  Grid,
  Header,
  Segment,
  Button,
  Form,
  Input,
  Menu
} from "semantic-ui-react";

export default class CampaignsSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        general: {}
      },
      section: "general"
    };
    this._handleNav = this._handleNav.bind(this);
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
  _handleNav(section) {
    return () => {
      this.setState({ section });
    };
  }
  _handleSubmit(ev) {
    ev.preventDefault();
  }
  _handleChange() {}
  render() {
    const { formData, section } = this.state;
    const { loading, campaign } = this.props;
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
                {section == "general" ? (
                  <Segment>
                    <Form onSubmit={this._handleSubmit}>
                      <Form.Field
                        control={Input}
                        label="Campaign name"
                        name="name"
                        value={formData.general.name}
                        onChange={this._handleChange}
                      />
                      <Button fluid primary>Save</Button>
                    </Form>
                  </Segment>
                ) : null}
              </Segment.Group>
            </div>
          )}
        </section>
      </div>
    );
  }
}
