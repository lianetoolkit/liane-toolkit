import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Form, Grid, Button } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

export default class AddContextPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("AddContextPage init", { props });
    this.state = {
      fields: {
        name: "",
        geolocations: [],
        audienceCategories: []
      },
      isLoading: false
    };
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _handleSubmit(e) {
    const { fields } = this.state;
    this.setState({ isLoading: true });
    Meteor.call("contexts.create", fields, (error, data) => {
      this.setState({ isLoading: false });
      if (error) {
        Alerts.error(error);
      } else {
        Alerts.success("Context was created successfully");
      }
    });
  }
  render() {
    const { loading, currentUser, available } = this.props;
    const { fields, isLoading } = this.state;
    const geolocationOptions = [];
    available.geolocations.forEach(geolocation => {
      geolocationOptions.push({
        key: geolocation._id,
        text: geolocation.name,
        value: geolocation._id
      });
    });
    const audienceCategoryOptions = [];
    available.audienceCategories.forEach(audienceCategory => {
      audienceCategoryOptions.push({
        key: audienceCategory._id,
        text: audienceCategory.title,
        value: audienceCategory._id
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
                      value={fields.name}
                    />
                    <Form.Dropdown
                      options={geolocationOptions}
                      placeholder="Choose locations"
                      name="geolocations"
                      search
                      selection
                      fluid
                      multiple
                      value={fields.geolocations}
                      onChange={this._handleChange}
                    />
                    <Form.Dropdown
                      options={audienceCategoryOptions}
                      placeholder="Choose audience categories"
                      name="audienceCategories"
                      search
                      selection
                      fluid
                      multiple
                      value={fields.audienceCategories}
                      onChange={this._handleChange}
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
