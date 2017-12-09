import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Form, Grid, Button } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

const initialFields = {
  name: "",
  mainGeolocationId: "",
  geolocations: [],
  audienceCategories: []
};

export default class EditContextsPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("EditContextsPage init", { props });
    this.state = {
      fields: Object.assign({}, initialFields),
      isLoading: false
    };
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.context) {
      if (nextProps.context._id) {
        const { fields } = this.state;
        const {
          _id,
          name,
          mainGeolocationId,
          geolocations,
          audienceCategories
        } = nextProps.context;
        this.setState({
          fields: {
            ...fields,
            _id,
            name,
            mainGeolocationId,
            geolocations,
            audienceCategories
          }
        });
      } else {
        this.setState({
          fields: Object.assign({}, initialFields)
        });
      }
    }
  }
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _handleSubmit(e) {
    const { contextId } = this.props;
    const { fields } = this.state;
    this.setState({ isLoading: true });
    if (contextId) {
      Meteor.call("contexts.update", fields, error => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Context was updated successfully");
        }
      });
    } else {
      Meteor.call("contexts.create", fields, (error, contextId) => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Context was created successfully");
          FlowRouter.withReplaceState(function() {
            FlowRouter.setParams({ contextId });
          });
        }
      });
    }
  }
  render() {
    const { contextId, context, loading, currentUser, available } = this.props;
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
        <PageHeader
          title="Contexts"
          titleTo={FlowRouter.path("App.admin.contexts")}
          subTitle={
            contextId ? `Editing ${context ? context.name : ""}` : "New Context"
          }
        />
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
                      placeholder="Choose main geolocation"
                      name="mainGeolocationId"
                      search
                      selection
                      fluid
                      value={fields.mainGeolocationId}
                      onChange={this._handleChange}
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
