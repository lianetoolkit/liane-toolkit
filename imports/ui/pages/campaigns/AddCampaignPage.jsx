import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import SelectFacebookAccountField from "/imports/ui/components/facebook/SelectFacebookAccountField.jsx";
import AdAccountField from "/imports/ui/components/facebook/AdAccountField.jsx";

import {
  Form,
  Grid,
  Button,
  Dropdown,
  Input,
  Divider
} from "semantic-ui-react";

import moment from "moment";

export default class AddCampaignPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("AddCampaignPage init", { props });
    this.state = {
      contexts: [],
      name: "",
      facebookAccountId: "",
      contextId: "",
      adAccountId: "",
      description: "",
      isLoading: false
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.contexts != this.props.contexts) {
      const contexts = nextProps.contexts.map(c => ({
        key: c._id,
        text: c.name,
        value: c._id
      }));
      this.setState({
        contexts
      });
    }
  }
  _handleChange = (e, { name, value }) => this.setState({ [name]: value });
  _handleSubmit(e) {
    const {
      name,
      description,
      contextId,
      adAccountId,
      facebookAccountId
    } = this.state;
    if (name && contextId) {
      this.setState({ isLoading: true });
      Meteor.call(
        "campaigns.create",
        { name, description, contextId, adAccountId, facebookAccountId },
        (error, data) => {
          this.setState({ isLoading: false });
          if (error) {
            console.log(error);
            Alerts.error(error);
          } else {
            Alerts.success("Campaign was successfully created");
            FlowRouter.go("App.campaignCanvas", { campaignId: data.result });
          }
        }
      );
    }
  }
  render() {
    const { loading, currentUser } = this.props;
    const {
      contexts,
      name,
      description,
      context,
      isLoading
    } = this.state;
    return (
      <div>
        <PageHeader title="New Campaign" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form onSubmit={this._handleSubmit}>
                    <Form.Field
                      control={Input}
                      label="Name"
                      name="name"
                      onChange={this._handleChange}
                      placeholder="Campaign name"
                    />
                    <Form.Field
                      control={Dropdown}
                      label="Select a context"
                      placeholder="Select context"
                      selection
                      onChange={this._handleChange}
                      options={contexts}
                      name="contextId"
                      placeholder="Select context"
                    />
                    <SelectFacebookAccountField
                      name="facebookAccountId"
                      label="Select the facebook account for your campaign"
                      onChange={this._handleChange}
                    />
                    <AdAccountField
                      label="Select your ad account for audience and ad creation"
                      onChange={this._handleChange}
                      name="adAccountId"
                    />
                    <Button fluid primary type="submit" loading={isLoading}>
                      Submit
                    </Button>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
