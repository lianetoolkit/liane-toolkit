import React from "react";
import PropTypes from "prop-types";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import {
  Form,
  Grid,
  Button,
  Icon,
  Radio,
  Input,
  Checkbox,
  Select,
  Message
} from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import _ from "underscore";

const initialFields = {
  useConnection: true
};

export default class AdsCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      fields: Object.assign({}, initialFields)
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentDidUpdate(prevProps, prevState) {
    const { fields } = this.state;
    const { campaignId, audienceCategoryId, facebookAccountId } = this.props;
    if(prevState.fields.geolocationId !== fields.geolocationId) {
      Meteor.call("audiences.accountAudienceItem", {
        campaignId,
        audienceCategoryId,
        facebookAccountId,
        geolocationId: fields.geolocationId
      }, (error, result) => {
        if(!error) {
          this.setState({
            estimate: result
          });
        } else {
          console.log(error);
        }
      })
    }
  }
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _handleCheckbox = (e, { name, value }) => {
    const checked = this.state.fields[name];
    this.setState({
      fields: {
        ...this.state.fields,
        [name]: !checked
      }
    });
  };
  _handleSubmit(e) {
    const { audienceCategory } = this.props;
    const { fields } = this.state;
    this.setState({ isLoading: true });
    console.log(fields);
    // Meteor.call("geolocations.update", data, error => {
    //   this.setState({ isLoading: false });
    //   if (error) {
    //     Alerts.error(error);
    //   } else {
    //     Alerts.success("Geolocation was updated successfully");
    //   }
    // });
  }
  _getEstimate() {
    const { estimate, fields } = this.state;
    if(estimate) {
      if(fields.useConnection) {
        return estimate.estimate;
      } else {
        return estimate.location_estimate;
      }
    }
    return false;
  }
  render() {
    const {
      loading,
      audienceCategory,
      campaignId,
      facebookAccountId,
      geolocations
    } = this.props;
    const { estimate, fields, isLoading } = this.state;
    console.log(estimate);
    return (
      <div>
        <PageHeader
          title="Audience"
          titleTo={FlowRouter.path("App.campaignAudience", {
            campaignId: campaignId,
            facebookId: facebookAccountId
          })}
          subTitle={
            !loading ? `Create ad targeting ${audienceCategory.title}` : ""
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
                    <Form.Field
                      control={Input}
                      size="big"
                      placeholder="Name"
                      name="name"
                      loading={isLoading}
                      value={fields.name}
                      onChange={this._handleChange}
                    />
                    <Form.Field>Select the location target:</Form.Field>
                    <Form.Field>
                      {geolocations.map(geolocation => (
                        <Form.Field
                          control={Checkbox}
                          radio
                          key={geolocation._id}
                          checked={fields.geolocationId == geolocation._id}
                          onChange={this._handleChange}
                          name="geolocationId"
                          value={geolocation._id}
                          label={geolocation.name}
                        />
                      ))}
                    </Form.Field>
                    <Form.Field
                      control={Checkbox}
                      checked={fields.useConnection}
                      onChange={this._handleCheckbox}
                      name="useConnection"
                      label="Target to your facebook page"
                    />
                    {estimate ? (
                      <Message>
                        The estimate reach for this ad is {this._getEstimate()}
                      </Message>
                    ) : null}
                    <Button primary>
                      <Icon name="save" />
                      Create ad
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

AdsCreate.contextTypes = {
  confirmStore: PropTypes.object
};
