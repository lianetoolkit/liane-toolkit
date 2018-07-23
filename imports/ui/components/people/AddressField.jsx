import React from "react";
import { Form, Input } from "semantic-ui-react";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import _ from "underscore";

const Fragment = React.Fragment;

export default class AddressField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  componentDidMount() {
    const { value, country } = this.props;
    let formData = {};
    if (country) {
      formData.country = country;
    }
    if (value) {
      formData = {
        ...formData,
        ...value
      };
    }
    if (value) {
      this.setState({ formData });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { country } = this.props;
    const { formData } = this.state;
    let newFormData = { ...formData };
    if (
      nextProps.value &&
      JSON.stringify(formData) != JSON.stringify(nextProps.value)
    ) {
      newFormData = nextProps.value;
    }
    if (country != nextProps.country) {
      newFormData = { ...newFormData, country: nextProps.country };
    }
    this.setState({
      formData: newFormData
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange, name } = this.props;
    const { formData } = this.state;
    if (
      onChange &&
      JSON.stringify(prevState.formData) != JSON.stringify(formData)
    ) {
      onChange(null, { name, value: formData });
    }
  }
  _handleChange = (ev, { name, value }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      }
    });
  };
  _updateFromZipcodeData = _.debounce((country, zipcode) => {
    const { formData } = this.state;
    Meteor.call(
      "people.resolveZipcode",
      {
        country,
        zipcode
      },
      (err, res) => {
        if (res) {
          this.setState({
            formData: {
              ...formData,
              region: res.state,
              city: res.city,
              neighbourhood: res.neighborhood,
              street: res.street
            }
          });
        }
      }
    );
  }, 200);
  _handleZipcodeChange = (ev, { name, value }) => {
    const zipcode = value;
    const { formData } = this.state;
    this.setState({
      formData: {
        ...formData,
        zipcode
      }
    });
    this._updateFromZipcodeData(formData.country, zipcode);
  };
  render() {
    const { country, formData } = this.state;
    return (
      <div>
        <Form.Field
          control={CountryDropdown}
          label="País"
          defaultOptionLabel="Selecione um país"
          value={formData.country}
          valueType="short"
          onChange={value => {
            this._handleChange(null, { name: "country", value });
          }}
        />
        {formData.country ? (
          <Fragment>
            <Form.Field
              control={Input}
              name="zipcode"
              label="CEP"
              value={formData.zipcode}
              onChange={this._handleZipcodeChange}
            />
            <Form.Group widths="equal">
              <Form.Field
                control={RegionDropdown}
                country={formData.country}
                defaultOptionLabel="Selecione uma região"
                countryValueType="short"
                valueType="short"
                label="Estado"
                name="region"
                value={formData.region}
                onChange={value => {
                  this._handleCange(null, { name: "region", value });
                }}
              />
              <Form.Field
                control={Input}
                name="city"
                label="Cidade"
                value={formData.city}
                onChange={this._handleChange}
              />
              <Form.Field
                control={Input}
                name="neighbourhood"
                label="Bairro"
                value={formData.neighbourhood}
                onChange={this._handleChange}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field
                control={Input}
                name="street"
                label="Endereço"
                value={formData.street}
                onChange={this._handleChange}
              />
              <Form.Field
                control={Input}
                name="number"
                label="Número"
                value={formData.number}
                onChange={this._handleChange}
              />
              <Form.Field
                control={Input}
                name="complement"
                label="Complemento"
                value={formData.complement}
                onChange={this._handleChange}
              />
            </Form.Group>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
