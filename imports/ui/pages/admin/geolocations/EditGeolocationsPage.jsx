import React from "react";
import PropTypes from "prop-types";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import SelectGeolocationFacebook from "/imports/ui/components/geolocations/SelectGeolocationFacebook.jsx";
import SelectGeolocationNominatim from "/imports/ui/components/geolocations/SelectGeolocationNominatim.jsx";
import SelectGeolocationCoordinates from "/imports/ui/components/geolocations/SelectGeolocationCoordinates.jsx";
import { Form, Grid, Button, Icon, Radio } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import _ from "underscore";

const initialFields = {
  name: "",
  type: "location",
  facebook: "",
  osm: ""
};

export default class EditGeolocationsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      availableGeolocations: {},
      fields: Object.assign({}, initialFields)
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleRemove = this._handleRemove.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.geolocation) {
      if (nextProps.geolocation._id) {
        const { fields } = this.state;
        const {
          _id,
          type,
          name,
          facebook,
          osm,
          center
        } = nextProps.geolocation;
        this.setState({
          fields: Object.assign({}, initialFields, nextProps.geolocation)
        });
      } else {
        this.setState({
          fields: Object.assign({}, initialFields)
        });
      }
    }
  }
  componentDidUpdate() {}
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _handleSubmit(e) {
    const { geolocationId } = this.props;
    const { fields } = this.state;
    let data = {
      _id: geolocationId,
      name: fields.name,
      type: fields.type
    };
    if (data.type == "center") {
      data.center = fields.center;
    } else if (data.type == "location") {
      data.facebook = fields.facebook;
      data.osm = fields.osm;
    }
    data = _.pick(data, _.identity);
    this.setState({ isLoading: true });
    if (geolocationId) {
      Meteor.call("geolocations.update", data, error => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Geolocation was updated successfully");
        }
      });
    } else {
      Meteor.call("geolocations.create", data, (error, geolocationId) => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Geolocation was created successfully");
          FlowRouter.withReplaceState(function() {
            FlowRouter.setParams({ geolocationId });
          });
        }
      });
    }
  }
  _handleRemove(e) {
    e.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        const { geolocationId } = this.props;
        this.setState({ isLoading: true });
        if (geolocationId) {
          Meteor.call("geolocations.remove", { geolocationId }, error => {
            this.setState({ isLoading: false });
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("Geolocation was removed successfully");
              this.context.confirmStore.hide();
              FlowRouter.go("App.admin.geolocations");
            }
          });
        }
      }
    });
  }
  render() {
    const { geolocation, geolocationId, loading, currentUser } = this.props;
    const { fields, isLoading } = this.state;
    return (
      <div>
        <PageHeader
          title="Geolocations"
          titleTo={FlowRouter.path("App.admin.geolocations")}
          subTitle={
            geolocationId
              ? `Editing ${geolocation ? geolocation.name : ""}`
              : "New Geolocation"
          }
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form onSubmit={this._handleSubmit}>
                    <Form.Input
                      size="big"
                      placeholder="Name"
                      name="name"
                      loading={isLoading}
                      value={fields.name}
                      onChange={this._handleChange}
                    />
                    <Form.Field>
                      Select the type:{" "}
                      <Radio
                        checked={fields.type == "location"}
                        onChange={this._handleChange}
                        name="type"
                        value="location"
                        label="Location"
                      />{" "}
                      <Radio
                        checked={fields.type == "center"}
                        onChange={this._handleChange}
                        name="type"
                        value="center"
                        label="Center with radius"
                      />
                    </Form.Field>
                    {fields.type == "location" ? (
                      <div>
                        <Form.Field>
                          <SelectGeolocationFacebook
                            name="facebook"
                            multiple
                            value={fields.facebook}
                            onChange={this._handleChange}
                          />
                        </Form.Field>
                        <Form.Field>
                          <SelectGeolocationNominatim
                            name="osm"
                            value={fields.osm}
                            onChange={this._handleChange}
                          />
                        </Form.Field>
                      </div>
                    ) : null}
                    {fields.type == "center" ? (
                      <Form.Field>
                        <SelectGeolocationCoordinates
                          name="center"
                          value={fields.center}
                          onChange={this._handleChange}
                        />
                      </Form.Field>
                    ) : null}
                    {geolocationId ? (
                      <Button onClick={this._handleRemove} negative>
                        <Icon name="trash" />
                        Remove geolocation
                      </Button>
                    ) : (
                      ""
                    )}
                    <Button primary>
                      <Icon name="save" />
                      Save
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

EditGeolocationsPage.contextTypes = {
  confirmStore: PropTypes.object
};
