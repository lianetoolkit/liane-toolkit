import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Form, Statistic, Grid, Button } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import _ from "underscore";

export default class AddContextPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("AddContextPage init", { props });
    this.state = {
      name: "",
      locations: [],
      isLoading: false
    };
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  _handleChange = (e, { name, value }) => this.setState({ [name]: value });

  _handleSubmit(e) {
    const { name, locations } = this.state;
    const geolocations = locations;
    if (name && locations.length) {
      this.setState({ isLoading: true });
      Meteor.call("contexts.create", { name, geolocations }, (error, data) => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Context was created successfully");
        }
      });
    }
  }
  _handleSelectChange = (e, { value }) => this.setState({ locations: value });

  render() {
    const { loading, currentUser, geolocations } = this.props;
    const { name, locations, isLoading } = this.state;
    const options = [];
    _.each(geolocations, geoLocation => {
      options.push({
        key: geoLocation._id,
        text: geoLocation.name,
        value: geoLocation._id
      });
    });
    return (
      <div>
        <PageHeader title="Add Context" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form onSubmit={this._handleSubmit} loading={isLoading}>
                    <Form.Input
                      label="Name"
                      placeholder="Context name"
                      name="name"
                      onChange={this._handleChange}
                      value={name}
                    />
                    <Form.Dropdown
                      options={options}
                      placeholder="Choose Locations"
                      search
                      selection
                      fluid
                      multiple
                      value={locations}
                      onChange={this._handleSelectChange}
                    />
                    <Button type="submit">Submit</Button>
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
