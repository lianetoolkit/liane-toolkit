import React from "react";
import { Form, Input } from "semantic-ui-react";
import { RegionDropdown } from "react-country-region-selector";
import _ from "underscore";

export default class AddressForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  componentDidMount() {
    const { address } = this.props;
    if (address) {
      this.setState({
        formData: address
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { formData } = this.state;
    if (
      nextProps.address &&
      JSON.stringify(formData) != JSON.stringify(nextProps.address)
    ) {
      this.setState({
        formData: nextProps.address
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange } = this.props;
    const { formData } = this.state;
    if (
      onChange &&
      JSON.stringify(prevState.formData) != JSON.stringify(formData)
    ) {
      onChange(formData);
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
  _handleZipcodeChange = _.debounce((ev, { name, value }) => {
    const zipcode = value;
    const { country } = this.props;
    const { formData } = this.state;
    this.setState({
      formData: {
        ...formData,
        zipcode
      }
    });
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
              zipcode,
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
  render() {
    const { country } = this.props;
    const { formData } = this.state;
    return (
      <div>
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
            country={country}
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
      </div>
    );
  }
}
