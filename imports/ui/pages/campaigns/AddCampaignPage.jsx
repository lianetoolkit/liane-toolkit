import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import { Form, Grid, Button, Dropdown, Divider } from "semantic-ui-react";

import moment from "moment";

export default class AddCampaignPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("AddCampaignPage init", { props });
    this.state = {
      contexts: [],
      name: "",
      contextId: "",
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
    const { name, description, contextId } = this.state;
    if (name && contextId) {
      this.setState({ isLoading: true });
      Meteor.call(
        "campaigns.create",
        { name, description, contextId },
        (error, data) => {
          this.setState({ isLoading: false });
          if (error) {
            Alerts.error(error);
          } else {
            Alerts.success("Campaign was successfully created");
            FlowRouter.go("App.campaignDetail", { _id: data.result });
          }
        }
      );
    }
  }
  render() {
    const { loading, currentUser } = this.props;
    const { contexts, name, description, context, isLoading } = this.state;
    return (
      <div>
        <PageHeader title="Add Campaign" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form onSubmit={this._handleSubmit}>
                    <Form.Input
                      label="Name"
                      name="name"
                      onChange={this._handleChange}
                      placeholder="Campaign name"
                    />
                    <Form.TextArea
                      label="Description"
                      name="description"
                      onChange={this._handleChange}
                      placeholder="Campaign description"
                    />
                    <Dropdown
                      placeholder="Select Friend"
                      selection
                      onChange={this._handleChange}
                      options={contexts}
                      name="contextId"
                      placeholder="Select context"
                    />
                    <Divider />
                    <Button type="submit" loading={isLoading}>
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
