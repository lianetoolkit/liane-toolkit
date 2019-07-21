import React, { Component } from "react";
import styled, { css } from "styled-components";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import CountrySelect from "./CountrySelect.jsx";
import RegionSelect from "./RegionSelect.jsx";
import Form from "./Form.jsx";

const Container = styled.div``;

const Group = styled.div`
  display: flex;
  margin-left: -1rem;
  margin-right: -1rem;
  > label {
    margin-left: 1rem;
    margin-right: 1rem;
    flex: 1 1 0;
    &.grow {
      flex: 2 1 0;
    }
  }
  ${props =>
    props.secondary &&
    css`
      font-size: 0.9em;
    `}
`;

export default class AddressField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  componentDidMount() {
    const { value, country } = this.props;
    let formData = {};
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
  componentDidUpdate(prevProps, prevState) {
    const { country, onChange, name } = this.props;
    const { formData } = this.state;
    let value = { ...formData };
    if (!value.country) value.country = country;
    if (
      onChange &&
      JSON.stringify(prevState.formData) != JSON.stringify(formData)
    ) {
      onChange({ name, value });
    }
  }
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
  _handleZipcodeChange = ({ target }) => {
    const zipcode = target.value;
    const { formData } = this.state;
    this.setState({
      formData: {
        ...formData,
        zipcode
      }
    });
    this._updateFromZipcodeData(formData.country, zipcode);
  };
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  render() {
    const { country } = this.props;
    const { formData } = this.state;
    return (
      <Container>
        <Group>
          <Form.Field label="Country">
            <CountrySelect
              label="Country"
              value={formData.country || country}
              name="country"
              onChange={this._handleChange}
            />
          </Form.Field>
          {formData.country || country ? (
            <Form.Field label="Zipcode">
              <input
                type="text"
                name="zipcode"
                placeholder="Type a zipcode"
                value={formData.zipcode}
                onChange={this._handleZipcodeChange}
              />
            </Form.Field>
          ) : null}
        </Group>
        {formData.country || country ? (
          <>
            <Group secondary>
              <Form.Field label="Region">
                <RegionSelect
                  country={formData.country || country}
                  name="region"
                  onChange={this._handleChange}
                  value={formData.region}
                />
              </Form.Field>
              <Form.Field label="City">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Neighbourhood">
                <input
                  type="text"
                  name="neighbourhood"
                  value={formData.neighbourhood}
                  onChange={this._handleChange}
                />
              </Form.Field>
            </Group>
            <Group secondary>
              <Form.Field label="Street address" className="grow">
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Number">
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Complement">
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={this._handleChange}
                />
              </Form.Field>
            </Group>
          </>
        ) : null}
      </Container>
    );
  }
}
