import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import {
  Form,
  Grid,
  Button,
  Select,
  Dropdown,
  Header,
  List
} from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

const initialFields = {
  name: "",
  facebook: ""
};

export default class EditGeolocationsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      availableGeolocations: {},
      fields: Object.assign({}, initialFields)
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.geolocation) {
      if (nextProps.geolocation._id) {
        const { fields } = this.state;
        this._updateAvailableFBGeolocations(nextProps.geolocation.facebook);
        const { _id, name, facebook } = this._parseIncoming(
          nextProps.geolocation
        );
        this.setState({
          fields: {
            ...fields,
            _id,
            name,
            facebook
          }
        });
      } else {
        this.setState({
          fields: Object.assign({}, initialFields)
        });
      }
    }
  }
  _parseOutgoing(fields) {
    let outgoing = {};
    for (const key in fields) {
      switch (key) {
        case "facebook": {
          outgoing[key] = JSON.parse(fields[key]);
          break;
        }
        default: {
          outgoing[key] = fields[key];
        }
      }
    }
    return outgoing;
  }
  _parseIncoming(fields) {
    let incoming = {};
    for (const key in fields) {
      switch (key) {
        case "facebook": {
          incoming[key] = JSON.stringify(fields[key]);
          break;
        }
        default: {
          incoming[key] = fields[key];
        }
      }
    }
    return incoming;
  }
  _getFBGeolocationContent(geolocation) {
    let description = `Type: ${geolocation.type}`;
    if (geolocation.region) {
      description += ` Region: ${geolocation.region}`;
    }
    if (geolocation.country_code) {
      description += ` Country code: ${geolocation.country_code}`;
    }
    return (
      <div>
        <Header content={geolocation.name} subheader={`${geolocation.type}`} />
        <List horizontal>
          {geolocation.region ? (
            <List.Item>{geolocation.region}</List.Item>
          ) : (
            ""
          )}
          {geolocation.country_name ? (
            <List.Item>{geolocation.country_name}</List.Item>
          ) : (
            ""
          )}
        </List>
      </div>
    );
  }
  _updateAvailableFBGeolocations(data = []) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (data.length) {
      let geolocations = {};
      data.forEach(geolocation => {
        let str = JSON.stringify(geolocation);
        geolocations[geolocation.key] = {
          key: geolocation.key,
          value: str,
          text: geolocation.name,
          content: this._getFBGeolocationContent(geolocation)
        };
      });
      this.setState({
        availableGeolocations: Object.assign(
          {},
          this.state.availableGeolocations,
          geolocations
        )
      });
    }
  }
  _searchFBGeolocations = _.debounce((ev, data) => {
    if (data.searchQuery) {
      Meteor.call(
        "geolocations.searchAdGeolocations",
        { q: data.searchQuery },
        (error, res) => {
          if (error) {
            console.log(error);
          } else {
            this._updateAvailableFBGeolocations(res.data);
          }
        }
      );
    }
  }, 200);
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _handleSubmit(e) {
    const { geolocationId } = this.props;
    const { fields } = this.state;
    const data = this._parseOutgoing(fields);
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
  render() {
    const { geolocation, geolocationId, loading, currentUser } = this.props;
    const { fields, availableGeolocations } = this.state;
    const geolocationOptions = Object.values(availableGeolocations);
    return (
      <div>
        <PageHeader
          title="Geolocations"
          titleTo={FlowRouter.path("App.admin.geolocations")}
          subTitle={
            geolocation && geolocationId
              ? `Editing ${geolocation.name}`
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
                      value={fields.name}
                      onChange={this._handleChange}
                    />
                    <Form.Dropdown
                      options={geolocationOptions}
                      placeholder="Search a Facebook Geolocation"
                      name="facebook"
                      search
                      selection
                      fluid
                      value={fields.facebook}
                      onSearchChange={this._searchFBGeolocations}
                      onChange={this._handleChange}
                    />
                    <Button>Send</Button>
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
